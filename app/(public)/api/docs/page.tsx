import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { JsonLd } from "@/components/app/json-ld"
import ApiSandbox from "@/components/public/api-sandbox"
import CopyCode from "@/components/public/copy-code"
import EndpointReference from "@/components/public/endpoint-reference"
import { endpointsOf, getApiSpec } from "@/lib/openapi"
import { SITE_URL, pageMetadata } from "@/lib/site"

export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  title: "API docs",
  description:
    "Run name generation, domain and handle checks, AI association checks, and watchlists from your own scripts with an Unclaimed by AI API key.",
  path: "/api/docs",
})

const BASE = "https://unclaimedbyai.com/api/v1"

/**
 * Tags an integrator with a key actually calls, in the order they are
 * usually needed. The browser-only surfaces, and the internal health and
 * stats endpoints, are left out on purpose: documenting them invites
 * someone to call something that was never meant for a script.
 */
const TAG_ORDER = [
  "checks",
  "searches",
  "names",
  "sandboxes",
  "research",
  "watches",
  "billing",
  "me",
  "api-keys",
]

const TAG_LABELS: Record<string, string> = {
  checks: "Check one name",
  searches: "Generate and poll searches",
  names: "Add names and run checks",
  sandboxes: "Sandboxes and idea generation",
  research: "Market research",
  watches: "Watchlist",
  billing: "Plans, credits, and orders",
  me: "Your account",
  "api-keys": "API keys",
}

export default async function ApiDocsPage() {
  const spec = await getApiSpec()
  const endpoints = spec ? endpointsOf(spec) : []
  const groups = TAG_ORDER.map((tag) => ({
    tag,
    label: TAG_LABELS[tag] ?? tag,
    endpoints: endpoints.filter((endpoint) => endpoint.tag === tag),
  })).filter((group) => group.endpoints.length > 0)

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          name: "Unclaimed by AI API docs",
          description:
            "Run name generation, availability checks, AI association checks, and watchlists from your own scripts.",
          url: `${SITE_URL}/api/docs`,
          author: { "@type": "Organization", name: "Unclaimed by AI" },
        }}
      />

      <section className="space-y-5 border-b px-4 py-10 sm:text-center">
        <Badge
          className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
          asChild
        >
          <p className="px-2 py-1 sm:px-3">For builders</p>
        </Badge>
        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            The Unclaimed by AI API
          </h1>
          <p className="mx-auto max-w-prose text-muted-foreground md:text-lg">
            Everything the product does, available to your scripts: generate
            names from a brief, check one exact name across domains, handles,
            and AI associations, poll results while they stream in, and keep a
            watchlist. One key, your account, your credits.
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:justify-center gap-2">
          <Button size="lg" asChild>
            <Link href="#reference">Read the reference</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#sandbox">Try it in the sandbox</Link>
          </Button>
        </div>
      </section>

      <section id="sandbox" className="scroll-mt-20 border-b px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-4">
          <div className="space-y-1 sm:text-center">
            <h2 className="font-heading text-2xl font-semibold md:text-3xl">
              Try it from this page
            </h2>
            <p className="mx-auto max-w-prose text-sm text-muted-foreground">
              Paste your key, change what you want, and send the request to
              production from your browser, with the response rendered right
              there.
            </p>
          </div>
          <ApiSandbox />
        </div>
      </section>

      <section id="authentication" className="scroll-mt-20 border-b px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-1 sm:text-center">
            <h2 className="font-heading text-2xl font-semibold md:text-3xl">
              Authentication
            </h2>
            <p className="mx-auto max-w-prose text-sm text-muted-foreground">
              Every authenticated request carries your key as a bearer token.
              Keys spend your account&apos;s searches and credits, are shown
              once at creation, and can be revoked instantly.
            </p>
          </div>
          <CopyCode
            code={`curl ${BASE}/me \\
  -H "Authorization: Bearer uba_live_YOUR_KEY"`}
          />
          <p className="text-sm text-muted-foreground">
            Create keys in the{" "}
            <Link
              href="/dashboard/account?tab=api"
              className="text-primary underline"
            >
              API tab of your account page
            </Link>
            . Two things stay session-only on purpose: managing keys and
            deleting your account, so a leaked key can do neither. Sign-in
            itself is a browser flow, with a magic link or Google, and is
            documented in the app rather than here.
          </p>
        </div>
      </section>

      <section id="reference" className="scroll-mt-20 border-b px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="space-y-1 sm:text-center">
            <h2 className="font-heading text-2xl font-semibold md:text-3xl">
              Reference
            </h2>
            <p className="mx-auto max-w-prose text-sm text-muted-foreground">
              Every endpoint a key can call, with its parameters, request
              body, and response fields. Generated from the API&apos;s own
              schema, so it cannot drift from what the server accepts.
            </p>
          </div>

          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              The reference could not be loaded right now. The quickstarts
              above and the sandbox still work.
            </p>
          ) : (
            <>
              <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {groups.map((group) => (
                  <a
                    key={group.tag}
                    href={`#tag-${group.tag}`}
                    className="text-primary underline"
                  >
                    {group.label}
                  </a>
                ))}
              </nav>
              {groups.map((group) => (
                <div key={group.tag} id={`tag-${group.tag}`} className="scroll-mt-20 space-y-4">
                  <h3 className="font-heading text-2xl font-semibold">
                    {group.label}
                  </h3>
                  {group.endpoints.map((endpoint) => (
                    <EndpointReference
                      key={`${endpoint.method}-${endpoint.path}`}
                      endpoint={endpoint}
                    />
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-1 sm:text-center">
            <h2 className="font-heading text-2xl font-semibold md:text-3xl">
              Quickstarts
            </h2>
            <p className="mx-auto max-w-prose text-sm text-muted-foreground">
              Three copy-paste paths that cover most of what people build.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-heading text-xl font-semibold">
              1. Check one exact name
            </h3>
            <CopyCode
              code={`curl -X POST ${BASE}/checks/direct \\
  -H "Authorization: Bearer uba_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Nexuare"}'

202 Accepted
{"search_id": 123, "name_id": 456}`}
            />
            <p className="text-sm text-muted-foreground">
              The first check on any name is free. Poll the results for
              scored names, and for names still running, whose job fills in
              with domains, handles, and per-model progress as it arrives.
            </p>
            <CopyCode
              code={`curl ${BASE}/searches/123/results \\
  -H "Authorization: Bearer uba_live_YOUR_KEY"`}
            />
          </div>

          <div className="space-y-3">
            <h3 className="font-heading text-xl font-semibold">
              2. Generate names from a brief
            </h3>
            <CopyCode
              code={`curl -X POST ${BASE}/searches/generate \\
  -H "Authorization: Bearer uba_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "an AI note-taking app for lawyers"}'

202 Accepted
{"id": 124, "generation": {"status": "generating"}}

curl ${BASE}/searches/124/header \\
  -H "Authorization: Bearer uba_live_YOUR_KEY"`}
            />
            <p className="text-sm text-muted-foreground">
              Sharpened briefs, four naming studios, a judge pass, and live
              .com screening. Accounts spend one search. Poll the header
              until generation reports ready.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-heading text-xl font-semibold">
              3. Guard a name while you decide
            </h3>
            <CopyCode
              code={`curl -X POST ${BASE}/watches \\
  -H "Authorization: Bearer uba_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"search_id": 123, "name": "Nexuare"}'

curl -X POST ${BASE}/watches/1/sweep \\
  -H "Authorization: Bearer uba_live_YOUR_KEY"`}
            />
            <p className="text-sm text-muted-foreground">
              Watches recheck domains and handles every few hours and are
              free. Sweep on demand when you are impatient.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-1 sm:text-center">
            <h2 className="font-heading text-2xl font-semibold md:text-3xl">
              Limits and errors
            </h2>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Rate limits.</strong> Six
              hundred requests a minute per address by default, ten a minute on
              sign-in endpoints, and twenty an hour on spend paths such as
              checks and generation. Limits answer with 429 and a Retry-After
              header, and they count per address, so heavy automation from one
              machine hits them first.
            </li>
            <li>
              <strong className="text-foreground">Billing.</strong> Every
              search and check moves your account&apos;s balances, readable
              through GET /me. Purchases happen through the product, not the
              API.
            </li>
            <li>
              <strong className="text-foreground">Errors.</strong> Responses
              carry a JSON detail field. 401 means missing or invalid
              credentials, 402 means you are out of searches or credits, 403
              is the human check on anonymous traffic only, 409 means a check
              for that name is already running, 422 is validation, and 502
              means the AI providers were unavailable at that moment.
            </li>
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3 border p-4">
            <p className="max-w-prose text-sm text-muted-foreground">
              Want the product instead of the pipeline? The app wraps every
              endpoint above in a view built for deciding, not for parsing.
            </p>
            <Button asChild>
              <Link href="/">Try it on the website</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
