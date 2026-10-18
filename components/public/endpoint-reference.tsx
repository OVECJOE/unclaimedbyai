import { cn } from "@/lib/utils"
import type { SchemaObject, SpecEndpoint } from "@/lib/openapi"

/**
 * The concrete schema behind a field, looking through the anyOf that
 * FastAPI uses to mark a field nullable. A nullable model arrives as
 * anyOf[Model, null], and without this the model's own fields would be
 * invisible to the field list.
 */
function concreteOf(
  schema: SchemaObject | undefined
): SchemaObject | undefined {
  if (!schema?.anyOf) return schema
  return schema.anyOf.find(
    (part) => part.type !== "null" && part.properties
  ) ?? schema
}

function typeLabel(schema: SchemaObject | undefined): string {
  if (!schema) return "unknown"
  if (schema.const !== undefined) return `"${schema.const}"`
  if (schema.type === "array") {
    const inner = schema.items ? typeLabel(schema.items) : "unknown"
    return inner.includes("|") ? `(${inner})[]` : `${inner}[]`
  }
  if (schema.type === "object" || schema.properties) return "object"
  if (schema.anyOf) {
    const parts = schema.anyOf
      .map((part) => typeLabel(part))
      .filter((part) => part !== "null")
    const nullable = schema.anyOf.some((part) => part.type === "null")
    const joined = [...new Set(parts)].join(" | ")
    return nullable ? `${joined} | null` : joined
  }
  return schema.type ?? "unknown"
}

function requiredSet(schema: SchemaObject | undefined): Set<string> {
  const required = new Set<string>()
  // OpenAPI marks required at the schema level, but a $ref that was
  // already resolved carries it too, so both are read.
  const raw = (schema as { required?: string[] } | undefined)?.required
  for (const key of raw ?? []) required.add(key)
  return required
}

function FieldRow({
  name,
  schema,
  required,
  indent = false,
  depth = 0,
}: {
  name: string
  schema: SchemaObject | undefined
  required: boolean
  indent?: boolean
  // The resolver guards the data at depth 4, but a self-referential
  // schema would still render forever without a guard here.
  depth?: number
}) {
  // Every field of a nested object is shown, with no cap, because a
  // truncated list is indistinguishable from a complete one and would
  // hide a field from whoever is integrating against it.
  const concrete = concreteOf(schema)
  const nested =
    depth >= 4
      ? []
      : concrete?.properties
        ? Object.entries(concrete.properties)
        : []
  return (
    <li className={cn(indent && "pl-4")}>
      <div className="flex flex-wrap items-baseline gap-2">
        <code className="font-mono text-xs">{name}</code>
        <span className="font-mono text-xs text-muted-foreground">
          {typeLabel(schema)}
        </span>
        {required ? (
          <span className="text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
            required
          </span>
        ) : null}
      </div>
      {schema?.description ? (
        <p className="mt-0.5 text-sm text-muted-foreground">
          {schema.description}
        </p>
      ) : null}
      {nested.length > 0 ? (
        <ul className="mt-1 space-y-1 border-l pl-3">
          {nested.map(([key, child]) => (
            <FieldRow
              key={key}
              name={key}
              schema={child}
              required={requiredSet(schema).has(key) || requiredSet(concrete).has(key)}
              indent
              depth={depth + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

/**
 * One endpoint, rendered from the OpenAPI operation it came from.
 *
 * Everything an integrator needs to write the call without firing it:
 * what it does, what it takes, what it returns, and how it fails.
 */
export default function EndpointReference({
  endpoint,
}: {
  endpoint: SpecEndpoint
}) {
  const requestBodySchema = endpoint.requestBodySchema
  const bodyFields = requestBodySchema?.properties
    ? Object.entries(requestBodySchema.properties)
    : []
  const bodyRequired = requiredSet(requestBodySchema)
  const response = endpoint.responseSchema
  const responseFields =
    response?.properties && Object.keys(response.properties).length > 0
      ? Object.entries(response.properties)
      : []

  return (
    <div id={`${endpoint.method}-${endpoint.path}`} className="scroll-mt-20 space-y-3 border-b py-8">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "w-14 shrink-0 border px-1 py-0.5 text-center font-mono text-[0.625rem] font-semibold",
            endpoint.method === "get"
              ? "border-green-600/40 text-green-700 dark:text-green-400"
              : "border-primary/40 text-primary"
          )}
        >
          {endpoint.method.toUpperCase()}
        </span>
        <code className="font-mono text-sm break-all">{endpoint.path}</code>
      </div>

      <p className="font-heading text-xl font-semibold">{endpoint.summary}</p>
      {endpoint.description ? (
        <p className="max-w-prose text-sm text-muted-foreground">
          {endpoint.description}
        </p>
      ) : null}

      {endpoint.parameters.length > 0 ? (
        <div>
          <p className="text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
            Parameters
          </p>
          <ul className="mt-2 space-y-2">
            {endpoint.parameters.map((parameter) => (
              <li key={`${parameter.in}-${parameter.name}`}>
                <div className="flex flex-wrap items-baseline gap-2">
                  <code className="font-mono text-xs">{parameter.name}</code>
                  <span className="font-mono text-xs text-muted-foreground">
                    {typeLabel(parameter.schema)}
                  </span>
                  <span className="text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
                    {parameter.in}
                  </span>
                  {parameter.required ? (
                    <span className="text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
                      required
                    </span>
                  ) : null}
                </div>
                {parameter.description ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {parameter.description}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {bodyFields.length > 0 ? (
        <div>
          <p className="text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
            Request body
            {endpoint.requestBodyRequired ? " (required)" : " (optional)"}
          </p>
          <ul className="mt-2 space-y-2">
            {bodyFields.map(([key, schema]) => (
              <FieldRow
                key={key}
                name={key}
                schema={schema}
                required={bodyRequired.has(key)}
              />
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <p className="text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
          Response
          {endpoint.responseDescription
            ? ` (${endpoint.responseDescription.toLowerCase()})`
            : ""}
        </p>
        {responseFields.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {responseFields.map(([key, schema]) => (
              <FieldRow
                key={key}
                name={key}
                schema={schema}
                required={requiredSet(response).has(key)}
              />
            ))}
          </ul>
        ) : (
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {typeLabel(response)}
          </p>
        )}
      </div>

      {endpoint.errors.length > 0 ? (
        <div>
          <p className="text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
            Can also fail with
          </p>
          <ul className="mt-2 space-y-1.5">
            {endpoint.errors.map((error) => (
              <li key={error.status}>
                <div className="flex flex-wrap items-baseline gap-2">
                  <code className="font-mono text-xs">{error.status}</code>
                  <span className="text-sm text-muted-foreground">
                    {error.description}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
