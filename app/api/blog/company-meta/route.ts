import { lookup } from "node:dns/promises"
import { NextResponse } from "next/server"

export const revalidate = 86400

const HOSTNAME_RE =
  /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i

function isBlockedIp(ip: string): boolean {
  if (ip.includes(":")) {
    const h = ip.toLowerCase()
    return (
      h === "::1" ||
      h.startsWith("fe80:") ||
      h.startsWith("fc") ||
      h.startsWith("fd")
    )
  }
  const parts = ip.split(".").map(Number)
  if (
    parts.length !== 4 ||
    parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)
  ) {
    return true
  }
  const [a, b] = parts
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  )
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

export async function GET(request: Request) {
  const domain = new URL(request.url).searchParams
    .get("domain")
    ?.trim()
    .toLowerCase()

  if (!domain || !HOSTNAME_RE.test(domain)) {
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

  const target = `https://${domain}/`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(target, {
      signal: controller.signal,
      headers: {
        "User-Agent": "UnclaimedByAI-blogbot/1.0",
        Accept: "text/html",
      },
      next: { revalidate: 86400 },
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: "Site did not respond" },
        { status: 502 }
      )
    }
    const html = await res.text()

    const title =
      html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || null
    const description =
      tagAttr(html, "meta", "property", "og:description", "content") ??
      tagAttr(html, "meta", "name", "description", "content")
    const logo =
      [
        tagAttr(html, "meta", "property", "og:image", "content"),
        tagAttr(html, "meta", "name", "twitter:image", "content"),
      ]
        .map((src) => (src ? absolutize(src, target) : null))
        .find(Boolean) ?? null
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
  } catch {
    return NextResponse.json({ error: "Site did not respond" }, { status: 502 })
  } finally {
    clearTimeout(timer)
  }
}
