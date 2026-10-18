import { lookup } from "node:dns/promises"
import { NextResponse } from "next/server"

export const revalidate = 86400

const HOSTNAME_RE =
  /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i

const IPV4_LITERAL_RE = /^\d{1,3}(\.\d{1,3}){3}$/
const MAX_HTML_BYTES = 500_000

function isIpLiteral(host: string): boolean {
  if (host.startsWith("[") && host.endsWith("]")) return true
  if (host.includes(":")) return true
  return IPV4_LITERAL_RE.test(host)
}

function normalizeIp(ip: string): string {
  const h = ip.toLowerCase()
  const dotted = h.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/)
  if (dotted) return dotted[1]
  const hex = h.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/)
  if (hex) {
    const hi = Number.parseInt(hex[1], 16)
    const lo = Number.parseInt(hex[2], 16)
    return `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`
  }
  return h
}

function isBlockedIp(ip: string): boolean {
  const normalized = normalizeIp(ip)
  if (normalized.includes(":")) {
    const firstHextet = normalized.split(":")[0]
    const v = firstHextet === "" ? Number.NaN : Number.parseInt(firstHextet, 16)
    return (
      normalized === "::1" ||
      (!Number.isNaN(v) &&
        ((v & 0xfe00) === 0xfc00 ||
          (v & 0xffc0) === 0xfe80 ||
          (v & 0xff00) === 0xff00)) ||
      normalized.startsWith("64:ff9b:") ||
      normalized.startsWith("::ffff:")
    )
  }
  const parts = normalized.split(".").map(Number)
  if (
    parts.length !== 4 ||
    parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)
  ) {
    return true
  }
  const [a, b, c] = parts
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a >= 224 && a <= 239) ||
    a >= 240
  )
}

async function assertResolvedAddressesAllowed(host: string): Promise<boolean> {
  try {
    const addresses = await lookup(host, { all: true })
    return !addresses.some((a) => isBlockedIp(a.address))
  } catch {
    return false
  }
}

function tagAttr(
  html: string,
  tag: string,
  key: string,
  value: string,
  pick: string
): string | null {
  const el = html.match(
    new RegExp(`<${tag}[^>]+${key}=["']${value}["'][^>]*>`, "i")
  )?.[0]
  return (
    el?.match(new RegExp(`${pick}=["']([^"']*)["']`, "i"))?.[1]?.trim() || null
  )
}

function absolutize(href: string, base: string): string | null {
  try {
    const url = new URL(href, base)
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null
  } catch {
    return null
  }
}

type RenderedMeta = {
  title: string | null
  description: string | null
  logo: string | null
}

async function fetchRenderedMeta(target: string): Promise<RenderedMeta | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(
      `https://api.microlink.io?url=${encodeURIComponent(target)}`,
      {
        signal: controller.signal,
        next: { revalidate: 86400 },
      }
    )
    if (!res.ok) return null
    const body = (await res.json()) as {
      status?: string
      data?: {
        title?: string | null
        description?: string | null
        logo?: { url?: string | null } | null
      }
    }
    if (body.status !== "success" || !body.data) return null
    return {
      title: body.data.title?.trim() || null,
      description: body.data.description?.trim() || null,
      logo: body.data.logo?.url ?? null,
    }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

async function readCappedHtml(res: Response): Promise<string | null> {
  const type = res.headers.get("content-type") ?? ""
  if (type && !/(text\/html|text\/plain|xhtml)/i.test(type)) return null
  const reader = res.body?.getReader()
  if (!reader) return null
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > MAX_HTML_BYTES) {
      await reader.cancel().catch(() => {})
      return null
    }
    chunks.push(value)
  }
  const merged = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(merged)
}

export async function GET(request: Request) {
  const domain = new URL(request.url).searchParams
    .get("domain")
    ?.trim()
    .toLowerCase()

  if (!domain || !HOSTNAME_RE.test(domain) || isIpLiteral(domain)) {
    return NextResponse.json(
      { error: "Provide a valid domain, e.g. ?domain=acme.com" },
      { status: 400 }
    )
  }

  try {
    const addresses = await lookup(domain, { all: true })
    if (addresses.some((a) => isBlockedIp(a.address))) {
      return NextResponse.json({ error: "Domain not allowed" }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 })
  }

  const targets = domain.startsWith("www.")
    ? [`https://${domain}/`]
    : [`https://${domain}/`, `https://www.${domain}/`]

  let html: string | null = null
  let servedFrom = targets[0]
  let blocked = false

  for (const target of targets) {
    const host = new URL(target).hostname
    if (!(await assertResolvedAddressesAllowed(host))) {
      return NextResponse.json({ error: "Domain not allowed" }, { status: 400 })
    }
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)
    try {
      const res = await fetch(target, {
        signal: controller.signal,
        headers: {
          "User-Agent": "UnclaimedByAI-blogbot/1.0",
          Accept: "text/html",
        },
        next: { revalidate: 86400 },
      })
      if (res.ok) {
        html = await readCappedHtml(res)
        if (html !== null) {
          servedFrom = target
          break
        }
      }
      if (res.status === 401 || res.status === 403 || res.status === 429) {
        blocked = true
      }
    } catch {
      continue
    } finally {
      clearTimeout(timer)
    }
  }

  if (html === null) {
    if (blocked) {
      const rendered = await fetchRenderedMeta(targets[0])
      return NextResponse.json(
        {
          domain,
          url: targets[0],
          title: rendered?.title ?? null,
          description: rendered?.description ?? null,
          logo:
            rendered?.logo ??
            `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
          icon: null,
        },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=86400, stale-while-revalidate=604800",
          },
        }
      )
    }
    return NextResponse.json({ error: "Site did not respond" }, { status: 502 })
  }

  const target = servedFrom
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || null
  const description =
    tagAttr(html, "meta", "property", "og:description", "content") ??
    tagAttr(html, "meta", "name", "description", "content")
  const logo =
    [
      tagAttr(html, "meta", "property", "og:image", "content"),
      tagAttr(html, "meta", "name", "twitter:image", "content"),
    ]
      .map((src) => (src ? absolutize(src, target) : null))
      .find(Boolean) ??
    `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  const icon =
    [
      tagAttr(html, "link", "rel", "icon", "href"),
      tagAttr(html, "link", "rel", "shortcut icon", "href"),
      tagAttr(html, "link", "rel", "apple-touch-icon", "href"),
    ]
      .map((src) => (src ? absolutize(src, target) : null))
      .find(Boolean) ?? null

  return NextResponse.json(
    { domain, url: target, title, description, logo, icon },
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  )
}
