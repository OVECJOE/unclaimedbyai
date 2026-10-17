import "server-only"
import { API_ORIGIN } from "./api"

/**
 * The API's OpenAPI document, fetched once and cached at build time.
 *
 * The docs page renders its reference from this rather than from a
 * hand-written list, because a second source of truth drifts the moment
 * an endpoint changes and nobody notices until an integrator does.
 */

export type SchemaObject = {
  type?: string
  title?: string
  format?: string
  description?: string
  items?: SchemaObject
  properties?: Record<string, SchemaObject>
  $ref?: string
  anyOf?: SchemaObject[]
  "const"?: string | number | boolean
  examples?: unknown[]
  default?: unknown
}

export type ParameterObject = {
  name: string
  in: "path" | "query" | "header" | "cookie"
  required?: boolean
  description?: string
  schema?: SchemaObject
}

export type RequestBodyObject = {
  required?: boolean
  content?: Record<string, { schema?: SchemaObject }>
}

export type ResponseObject = {
  description?: string
  content?: Record<string, { schema?: SchemaObject }>
}

export type OperationObject = {
  tags?: string[]
  summary?: string
  description?: string
  operationId?: string
  parameters?: ParameterObject[]
  requestBody?: RequestBodyObject
  responses?: Record<string, ResponseObject>
}

export type ApiSpec = {
  info: { title: string; summary?: string; description?: string; version: string }
  paths: Record<string, Partial<Record<"get" | "post" | "put" | "patch" | "delete", OperationObject>>>
  components?: { schemas?: Record<string, SchemaObject> }
}

const METHODS = ["get", "post", "put", "patch", "delete"] as const
type Method = (typeof METHODS)[number]

/**
 * Tags an integrator with a key actually calls, in the order they are
 * usually needed. The browser-only surfaces, and the internal health and
 * stats endpoints, are left out on purpose: documenting them invites
 * someone to call something that was never meant for a script. Both the
 * HTML page and the markdown twin filter by this, so the two cannot
 * disagree about what is public.
 */
export const PUBLIC_TAGS = [
  "checks",
  "searches",
  "names",
  "sandboxes",
  "research",
  "watches",
  "billing",
  "me",
  "api-keys",
] as const

/**
 * Operations left out of the public reference even when their tag is
 * public. Deleting an account is session-only on purpose, and a key
 * cannot do it, so documenting it in a reference an agent follows would
 * only invite a call that cannot work.
 */
const HIDDEN_OPERATIONS = new Set(["delete:/me"])

function operationKey(method: Method, path: string): string {
  return `${method}:${path}`
}

export type SpecEndpoint = {
  method: Method
  path: string
  tag: string
  summary: string
  description: string | undefined
  parameters: ParameterObject[]
  requestBodySchema: SchemaObject | undefined
  requestBodyRequired: boolean
  responseSchema: SchemaObject | undefined
  responseDescription: string | undefined
  errors: { status: number; description: string }[]
}

/** Strip the version prefix so the docs show the path an integrator types. */
function displayPath(path: string): string {
  return path.replace(/^\/api\/v1/, "") || "/"
}

/**
 * Resolve a schema for display, following `$ref` pointers.
 *
 * FastAPI emits nested schemas as `$ref` pointers, so a field that is
 * itself a model arrives as an empty object unless it is resolved. The
 * depth guard is not paranoia: a schema that refers to itself, which
 * `allOf` inheritance produces routinely, would otherwise recurse until
 * the page never renders.
 */
export function resolveRef(
  spec: ApiSpec,
  schema: SchemaObject | undefined,
  depth = 0
): SchemaObject | undefined {
  if (!schema || depth > 4) return schema
  if (schema.$ref) {
    const name = schema.$ref.split("/").pop()
    const target = name ? spec.components?.schemas?.[name] : undefined
    return target ? resolveRef(spec, target, depth + 1) : schema
  }
  if (schema.items?.$ref) {
    return { ...schema, items: resolveRef(spec, schema.items, depth + 1) }
  }
  if (schema.properties) {
    const properties: Record<string, SchemaObject> = {}
    for (const [key, value] of Object.entries(schema.properties)) {
      properties[key] = resolveRef(spec, value, depth + 1) ?? value
    }
    return { ...schema, properties }
  }
  if (schema.anyOf) {
    // Nullable fields arrive as anyOf[Model, null], so the ref that holds
    // the real fields lives inside the anyOf and would otherwise render
    // as an empty object.
    return {
      ...schema,
      anyOf: schema.anyOf.map(
        (part) => resolveRef(spec, part, depth + 1) ?? part
      ),
    }
  }
  return schema
}

/**
 * Flatten the paths object into a list the reference can render in order.
 * The webhook is excluded: it is called by Stripe, and documenting it
 * would only invite someone to post to it.
 */
export function endpointsOf(spec: ApiSpec): SpecEndpoint[] {
  const out: SpecEndpoint[] = []
  for (const [path, operations] of Object.entries(spec.paths)) {
    for (const method of METHODS) {
      const op = operations[method]
      if (!op) continue
      const tag = op.tags?.[0] ?? "other"
      if (!PUBLIC_TAGS.includes(tag as (typeof PUBLIC_TAGS)[number])) continue
      if (HIDDEN_OPERATIONS.has(operationKey(method, displayPath(path)))) continue
      if (path.includes("/webhooks/")) continue
      out.push({
        method,
        path: displayPath(path),
        tag,
        summary: op.summary ?? path,
        description: op.description,
        parameters: op.parameters ?? [],
        requestBodySchema: resolveRef(
          spec,
          op.requestBody?.content?.["application/json"]?.schema
        ),
        requestBodyRequired: op.requestBody?.required ?? false,
        responseSchema: resolveRef(
          spec,
          op.responses?.["200"]?.content?.["application/json"]?.schema ??
            op.responses?.["201"]?.content?.["application/json"]?.schema
        ),
        responseDescription:
          op.responses?.["200"]?.description ?? op.responses?.["201"]?.description,
        // Everything that is not a success is what an integrator will hit
        // first, so it is kept rather than filtered out.
        errors: Object.entries(op.responses ?? {})
          // 422 is FastAPI's generic validation error, whose description
          // says nothing an integrator can act on. It is explained once
          // in the limits section instead of repeated on every route.
          .filter(
            ([code, value]) =>
              !code.startsWith("2") &&
              code !== "422" &&
              Boolean(value?.description)
          )
          .map(([code, value]) => ({
            status: Number(code),
            description: value?.description ?? "",
          }))
          .filter((error) => Number.isFinite(error.status)),
      })
    }
  }
  return out
}

export async function getApiSpec(): Promise<ApiSpec | null> {
  try {
    const res = await fetch(`${API_ORIGIN}/openapi.json`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return (await res.json()) as ApiSpec
  } catch {
    // A missing spec degrades to the quickstarts rather than failing the
    // page, because the sandbox and the prose still work without it.
    return null
  }
}
