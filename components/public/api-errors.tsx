/**
 * Limits and errors, as a table an integrator can scan.
 *
 * The status code is the row key because that is the thing on the
 * screen when something fails. Rendered as bordered rows rather than a
 * grid so it survives narrow viewports without a horizontal scroll.
 */
const ERRORS: { status: string; meaning: string }[] = [
  {
    status: "401",
    meaning:
      "Missing or invalid credentials. Check the bearer token is a live key from your account.",
  },
  {
    status: "402",
    meaning:
      "Out of searches or credits. Read your balance through GET /me and top up in the product.",
  },
  {
    status: "403",
    meaning:
      "The human check, on anonymous traffic only. A keyed request never sees it.",
  },
  {
    status: "409",
    meaning: "A check for that name is already running. Wait for it or poll it.",
  },
  {
    status: "422",
    meaning: "Validation failed. The JSON detail field names the field and why.",
  },
  {
    status: "429",
    meaning:
      "Rate limited. Respect the Retry-After header; limits count per address.",
  },
  {
    status: "502",
    meaning:
      "The AI providers were unavailable at that moment. Retry shortly.",
  },
]

export default function ApiErrors() {
  return (
    <div className="space-y-6">
      <ul className="divide-y border">
        {ERRORS.map((error) => (
          <li
            key={error.status}
            className="flex flex-col gap-1 p-3 sm:flex-row sm:items-baseline sm:gap-4"
          >
            <code className="shrink-0 border px-1.5 py-0.5 text-center font-mono text-xs font-semibold sm:w-14">
              {error.status}
            </code>
            <p className="text-sm text-muted-foreground">{error.meaning}</p>
          </li>
        ))}
      </ul>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Rate limits.</strong> Six hundred
          requests a minute per address by default, ten a minute on sign-in
          endpoints, and twenty an hour on spend paths such as checks and
          generation. Limits answer with 429 and a Retry-After header, and they
          count per address, so heavy automation from one machine hits them
          first.
        </p>
        <p>
          <strong className="text-foreground">Billing.</strong>{" "}
          Every search and check moves your account&apos;s balances, readable
          through GET /me.
          Purchases happen through the product, not the API.
        </p>
      </div>
    </div>
  )
}
