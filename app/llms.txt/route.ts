import { listPublishedPostsPage } from "@/lib/blog/store"
import { SITE_URL } from "@/lib/site"
import { nameToSlug } from "@/lib/utils"

/**
 * A curated map of the site for LLM agents, following the llmstxt.org
 * format: an H1, a blockquote summary, then H2 sections of links.
 *
 * Written as a route handler rather than a file in public/ because the
 * blog posts live in a database, so the file has to be assembled at
 * request time. Regenerated hourly, like the sitemap.
 */
export const dynamic = "force-static"
export const revalidate = 3600

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8007"

async function reportExamples(): Promise<string[]> {
  // Three recent public reports, so an agent can see the shape of the
  // artifact it is being asked about rather than only its name.
  try {
    const res = await fetch(`${API_BASE}/api/v1/searches/public-top?limit=3`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = (await res.json()) as { items: { top_name: string }[] }
    return data.items
      .filter((item) => item.top_name)
      .map((item) => item.top_name)
  } catch {
    return []
  }
}

export async function GET(): Promise<Response> {
  const [blog, reports] = await Promise.all([
    listPublishedPostsPage(1, 10),
    reportExamples(),
  ])

  // A title or a name can carry a newline, which would break the markdown
  // list and stop an agent from seeing the links that follow.
  const oneLine = (value: string) => value.replace(/\s+/g, " ").trim()

  const lines: string[] = [
    "# Unclaimed by AI",
    "",
    "> A name-checking and naming platform for founders. Generate name ideas from a brief, check one exact name across domains, social handles, and AI associations, poll results while they stream in, and keep a watchlist that rechecks names and emails you the moment something is claimed. Free to start, priced in credits.",
    "",
    "The product decides whether a name is safe to build on: it scores names out of 100 across domain availability, open social handles, and what major AI models already associate with the name. An API exposes the same pipeline for scripts, keyed per account.",
    "",
    "## Product",
    "",
    `- [Home](${SITE_URL}/): What the product does, in one screen.`,
    `- [How it works](${SITE_URL}/product): The check pipeline, explained.`,
    `- [Pricing](${SITE_URL}/pricing): Free and Pro tiers, and what a credit buys.`,
    `- [API docs](${SITE_URL}/api/docs): Every endpoint, with parameters, request bodies, and responses.`,
    "",
    "## Guides",
    "",
    // The worked example points at a real public report rather than a
    // /check/ permalink: that page is a JS kickoff whose canonical
    // points at /searches/<name>, and the name this used to link to
    // has no such sibling — an agent following the guide landed on a
    // canonical target that did not exist.
    ...(reports.length > 0
      ? [
          `- [Check one exact name](${SITE_URL}/searches/${nameToSlug(
            reports[0]
          )}): A worked example of a free first check, every score with its evidence.`,
        ]
      : []),
    `- [API quickstarts](${SITE_URL}/api/docs#quickstarts): Three copy-paste paths that cover most of what people build.`,
    "",
  ]

  const exampleReports = reports.slice(1)
  if (exampleReports.length > 0) {
    lines.push("## Example reports", "")
    for (const name of exampleReports) {
      lines.push(
        `- [Report for ${oneLine(name)}](${SITE_URL}/searches/${nameToSlug(
          name
        )}): A complete scored report, public by design.`
      )
    }
    lines.push("")
  }

  lines.push("## Blog", "")
  if (blog.items.length === 0) {
    lines.push(
      `- [Blog index](${SITE_URL}/blog): Writing about naming and name checking.`
    )
  } else {
    for (const post of blog.items) {
      const full = oneLine(post.excerpt)
      // Cut at a word boundary. A hard slice leaves a hyphen dangling at
      // the end, which reads as a broken word to an agent. An excerpt
      // shorter than the cap is left alone.
      const trimmed =
        full.length > 160
          ? `${full.slice(0, full.lastIndexOf(" ", 160)).trimEnd()}...`
          : full
      lines.push(
        `- [${oneLine(post.title)}](${SITE_URL}/blog/${post.slug}): ${trimmed}`
      )
    }
  }

  lines.push(
    "",
    "## Legal",
    "",
    `- [Privacy policy](${SITE_URL}/privacy): What is collected, why, and the affiliate disclosure.`,
    `- [Terms of service](${SITE_URL}/terms): Accounts, credits, and acceptable use.`,
    "",
    "## Optional",
    "",
    `- [API reference (markdown)](${SITE_URL}/api/docs.md): The same reference as clean markdown, for tooling and agents.`,
    `- [API reference (OpenAPI)](${SITE_URL}/api/v1/openapi.json): The machine-readable schema behind the API docs.`,
    ""
  )

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
