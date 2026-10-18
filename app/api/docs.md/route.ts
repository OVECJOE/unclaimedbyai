import { endpointsOf, getApiSpec } from "@/lib/openapi"
import { SITE_URL } from "@/lib/site"

/**
 * The API docs as plain markdown, at /api/docs.md.
 *
 * The HTML page is built for people; this is the same information shaped
 * for an agent, which wants one linear read rather than a rendered
 * layout. Linked from llms.txt so an agent can follow the map to clean
 * text instead of scraping navigation out of HTML.
 */
export const dynamic = "force-static"
export const revalidate = 3600

const BASE = `${SITE_URL}/api/v1`

function schemaText(schema: unknown): string {
  const s = schema as
    | { type?: string; properties?: Record<string, unknown>; anyOf?: unknown[] }
    | undefined
  if (!s) return "unknown"
  if (Array.isArray(s.anyOf)) {
    const parts = s.anyOf.map((part) => schemaText(part))
    return (
      [...new Set(parts.filter((part) => part !== "null"))].join(" | ") +
      " | null"
    )
  }
  if (s.type === "array") return `${schemaText({ type: "object" })}[]`
  if (s.properties) return "object"
  return s.type ?? "unknown"
}

export async function GET(): Promise<Response> {
  const spec = await getApiSpec()
  const endpoints = spec ? endpointsOf(spec) : []
  const byTag = new Map<string, typeof endpoints>()
  for (const endpoint of endpoints) {
    const list = byTag.get(endpoint.tag) ?? []
    list.push(endpoint)
    byTag.set(endpoint.tag, list)
  }

  const lines: string[] = [
    "# Unclaimed by AI API",
    "",
    "> Generate name ideas from a brief, check names across domains, social handles, and AI associations, poll results while they stream in, and keep a watchlist. One key, your account, your credits.",
    "",
    `Authenticate every request with a bearer key: \`curl ${BASE}/me -H "Authorization: Bearer uba_live_YOUR_KEY"\`. Keys are created in the account page and spend your balance. Two things stay session-only on purpose: managing keys and deleting your account.`,
    "",
  ]

  if (endpoints.length === 0) {
    lines.push(
      "The reference could not be loaded right now. See the HTML docs instead."
    )
  } else {
    for (const [tag, group] of byTag) {
      lines.push(`## ${tag}`, "")
      for (const endpoint of group) {
        lines.push(`### ${endpoint.method.toUpperCase()} ${endpoint.path}`, "")
        lines.push(endpoint.summary)
        lines.push("")
        if (endpoint.description) {
          lines.push(endpoint.description, "")
        }
        if (endpoint.parameters.length > 0) {
          lines.push("Parameters:", "")
          for (const parameter of endpoint.parameters) {
            const required = parameter.required ? "required" : "optional"
            lines.push(
              `- \`${parameter.name}\` (${parameter.in}, ${required}): ${
                parameter.description ?? schemaText(parameter.schema)
              }`
            )
          }
          lines.push("")
        }
        const body = endpoint.requestBodySchema?.properties
        if (body) {
          lines.push(
            endpoint.requestBodyRequired
              ? "Request body, JSON, required:"
              : "Request body, JSON, optional:",
            ""
          )
          for (const [key, value] of Object.entries(body)) {
            lines.push(`- \`${key}\`: ${schemaText(value)}`)
          }
          lines.push("")
        }
        lines.push("Response:", "")
        const response = endpoint.responseSchema?.properties
        if (response) {
          for (const [key, value] of Object.entries(response)) {
            lines.push(`- \`${key}\`: ${schemaText(value)}`)
          }
        } else {
          lines.push(`- ${schemaText(endpoint.responseSchema)}`)
        }
        lines.push("")
        if (endpoint.errors.length > 0) {
          lines.push("Can also fail with:", "")
          for (const error of endpoint.errors) {
            lines.push(`- ${error.status}: ${error.description}`)
          }
          lines.push("")
        }
      }
    }
  }

  lines.push(
    "## Errors",
    "",
    "Every error response carries a JSON detail field. 401 means missing or invalid credentials, 402 means you are out of searches or credits, 403 is the human check on anonymous traffic only, 409 means a check for that name is already running, 422 is validation, and 502 means the AI providers were unavailable at that moment.",
    "",
    `Rate limits answer with 429 and a Retry-After header: six hundred requests a minute per address by default, ten a minute on sign-in endpoints, and twenty an hour on spend paths such as checks and generation.`,
    "",
    `Full HTML documentation, with a live sandbox for firing requests from your browser: ${BASE.replace("/api/v1", "")}/api/docs`,
    ""
  )

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
