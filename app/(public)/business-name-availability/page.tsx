import type { Metadata } from "next"
import Link from "next/link"
import { JsonLd } from "@/components/app/json-ld"
import { Button } from "@/components/ui/button"
import { US_STATES } from "@/lib/states"
import { pageMetadata, SITE_URL } from "@/lib/site"

/**
 * The hub of the state cluster: one link per state, so the pages are
 * crawlable from a single hop and a reader who landed on the wrong
 * state can find theirs. Also the plain "business name availability"
 * keyword without a state — smaller volume, but the same intent.
 */

export const metadata: Metadata = pageMetadata({
  title: "Business name availability by state",
  description:
    "How business name availability works in every US state: what the state registry decides, and what it never checks — the .com, the social handles, and what AI models already associate with your name. The first check on every name is free.",
  path: "/business-name-availability",
})

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: US_STATES.map((state, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: `Business name availability in ${state.name}`,
    url: `${SITE_URL}/business-name-availability/${state.slug}`,
  })),
}

export default function BusinessNameAvailabilityHub() {
  return (
    <>
      <JsonLd data={itemListJsonLd} />

      <section className="border-b px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-5">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Business name availability,{" "}
            <span className="text-primary">state by state</span>
          </h1>
          <p className="max-w-prose text-muted-foreground md:text-lg">
            Every state has a registry that answers one question: is this
            entity name already on record? That is the legal answer, and it is
            the only one the state gives. The domain, the social handles, and
            what the AI models already think your name means are decided
            elsewhere — usually by whoever claims them first. Pick your state
            for the local process, then run the checks the registry
            doesn&rsquo;t.
          </p>
          <Button size="lg" className="h-auto px-8 py-5 text-lg" asChild>
            <Link href="/?mode=name">Check a name — first check free</Link>
          </Button>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-6">
          <h2 className="font-heading text-2xl font-semibold sm:text-center">
            Find your state
          </h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {US_STATES.map((state) => (
              <li key={state.slug}>
                <Button
                  variant="outline"
                  className="w-full justify-start font-normal"
                  asChild
                >
                  <Link href={`/business-name-availability/${state.slug}`}>
                    {state.name}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
