import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { JsonLd } from "@/components/app/json-ld"
import ApiErrors from "@/components/public/api-errors"
import ApiQuickstarts from "@/components/public/api-quickstarts"
import ApiReferenceBrowser, {
  type ReferenceGroup,
} from "@/components/public/api-reference-browser"
import ApiSandbox from "@/components/public/api-sandbox"
import CopyCode from "@/components/public/copy-code"
import { PUBLIC_TAGS, endpointsOf, getApiSpec } from "@/lib/openapi"
import { SITE_URL, pageMetadata } from "@/lib/site"

export const dynamic = "force-static"
export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  title: "API docs",
  description:
    "Run name generation, domain and handle checks, AI association checks, and watchlists from your own scripts with an Unclaimed by AI API key.",
  path: "/api/docs",
})

const BASE = `${SITE_URL}/api/v1`

/** Human labels for the tags the lib exposes as public. */
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

const STEPS = [
  {
    step: "01",
    title: "Get a key",
    body: "Create an API key in your account. It spends your searches and credits, and can be revoked instantly.",
  },
  {
    step: "02",
    title: "Send the request",
    body: "Every call carries the key as a bearer token. Point it at the endpoint that does what you need.",
  },
  {
    step: "03",
    title: "Poll for results",
    body: "Long jobs stream in. Poll the header or results endpoint until the job reports ready.",
  },
]

export default async function ApiDocsPage() {
  const spec = await getApiSpec()
  const endpoints = spec ? endpointsOf(spec) : []
  const groups: ReferenceGroup[] = PUBLIC_TAGS.map((tag) => ({
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

      <section className="space-y-5 border-b px-4 py-12 sm:text-center">
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
        <div className="flex flex-col gap-2 md:flex-row md:justify-center">
          <Button size="lg" asChild>
            <Link href="#quickstarts">Start with a quickstart</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#sandbox">Try it in the sandbox</Link>
          </Button>
        </div>
      </section>

      <section className="border-b px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <ol className="grid gap-4 md:grid-cols-3">
            {STEPS.map((item) => (
              <li key={item.step} className="space-y-2 border p-4">
                <span className="font-mono text-xs font-semibold tracking-widest text-primary">
                  {item.step}
                </span>
                <h2 className="font-heading text-xl font-semibold">
                  {item.title}
                </h2>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="quickstarts" className="scroll-mt-20 border-b px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-1 sm:text-center">
            <h2 className="font-heading text-2xl font-semibold md:text-3xl">
              Quickstarts
            </h2>
            <p className="mx-auto max-w-prose text-sm text-muted-foreground">
              Three copy-paste paths that cover most of what people build.
            </p>
          </div>
          <ApiQuickstarts />
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

      <section id="reference" className="scroll-mt-20 border-b px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-1 sm:text-center">
            <h2 className="font-heading text-2xl font-semibold md:text-3xl">
              Reference
            </h2>
            <p className="mx-auto max-w-prose text-sm text-muted-foreground">
              Every endpoint a key can call, with its parameters, request body,
              and response fields. Generated from the API&apos;s own schema, so
              it cannot drift from what the server accepts.
            </p>
          </div>

          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground md:text-center">
              The reference could not be loaded right now. The quickstarts above
              and the sandbox still work.
            </p>
          ) : (
            <ApiReferenceBrowser groups={groups} />
          )}
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="space-y-1 sm:text-center">
            <h2 className="font-heading text-2xl font-semibold md:text-3xl">
              Limits and errors
            </h2>
          </div>
          <ApiErrors />
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
