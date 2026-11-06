import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { JsonLd } from "@/components/app/json-ld"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { US_STATES, stateBySlug } from "@/lib/states"
import { pageMetadata } from "@/lib/site"

/**
 * One page per state for the "business name availability <state>"
 * searches (480/mo each for the big states, low difficulty). The
 * content is honest about the one thing the tool cannot do: only the
 * state registry decides the legal entity-name question. What the
 * page sells is everything the registry never checks — domain,
 * handles, and what the AI models already think the name means —
 * which is the check nobody else runs. Fully static: no fetch, no
 * per-state data to go stale.
 */

type PageProps = {
  params: Promise<{ state: string }>
}

export function generateStaticParams() {
  return US_STATES.map((state) => ({ state: state.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { state: slug } = await params
  const state = stateBySlug(slug)
  if (!state) return {}
  return pageMetadata({
    title: `Business name availability in ${state.name}`,
    description: `Check business name availability in ${state.name}: search the state registry for entity names, then check the .com, social handles on GitHub, X, Instagram, TikTok and YouTube, and what GPT, Claude and Perplexity already associate with the name. The first check is free.`,
    path: `/business-name-availability/${state.slug}`,
  })
}

function faqJsonLd(name: string, abbr: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How do I check if a business name is available in ${name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Two checks, two different authorities. The legal name — the one on your ${name} (${abbr}) entity filing — is decided by the state's business registry: search it for your exact name and close variants before you file. The rest of the name is decided elsewhere: whether the .com is open, whether the handles are free on GitHub, X, Instagram, TikTok and YouTube, and what GPT, Claude and Perplexity already associate with the name. Run those in one check before you fall for the name.`,
        },
      },
      {
        "@type": "Question",
        name: `Does the ${name} business registry check domains and social handles?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `No. The ${name} registry answers one question: is this entity name distinguishable from names already on record. A name can be approved by the state and still have a taken .com, no free handles, and a meaning in every AI model's head. That is the gap this page's check fills.`,
        },
      },
      {
        "@type": "Question",
        name: `Can I reserve a business name in ${name} before I file?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Most states let you reserve or hold a name for a while before you file, but the rules and fees are the registry's to set and they change — check with ${name}'s registry before counting on a reservation. A reservation holds the entity name only; it does nothing for the domain, the handles, or the AI associations, and those are what get claimed while you wait.`,
        },
      },
    ],
  }
}

const LAYERS: [string, string][] = [
  [
    "The entity name",
    "The registry in your state (the Secretary of State or the equivalent agency) decides whether a name is distinguishable from entities already on record. That answer lives with the state, and the filing is what makes the name yours.",
  ],
  [
    "The domain",
    "Nobody at the registry looks up the .com. A live lookup tells you in seconds whether it is open — checked now, not cached — because a name with a taken domain is a name you cannot own.",
  ],
  [
    "The handles",
    "GitHub, X, Instagram, TikTok, YouTube. A brand that cannot get its name on the platforms starts every launch explaining why it spells the name differently.",
  ],
  [
    "The AI associations",
    "Ask GPT, Claude and Perplexity what the name already means. If they already have an answer, you have a problem no domain search — and no registry — will ever catch. The check nobody else runs.",
  ],
]

export default async function StatePage({ params }: PageProps) {
  const { state: slug } = await params
  const state = stateBySlug(slug)
  if (!state) notFound()
  const { name, abbr } = state

  return (
    <>
      <JsonLd data={faqJsonLd(name, abbr)} />

      <section className="border-b px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-5">
          <Badge
            className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
            asChild
          >
            <p className="w-fit px-2 py-1 sm:px-3">
              <Link href="/business-name-availability">
                Business name availability, state by state
              </Link>
            </p>
          </Badge>
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Business name availability in{" "}
            <span className="text-primary">{name}</span>
          </h1>
          <p className="max-w-prose text-muted-foreground md:text-lg">
            Two different questions wear the same words. The {name} business
            registry answers the legal one — is this entity name already on
            record in {abbr}? It does not answer the others: whether the .com
            is open, whether the handles are free, or what the chatbots already
            think the name means. Here is how to answer all of them before you
            file.
          </p>
        </div>
      </section>

      {/* The four things "available" can mean. */}
      <section className="border-b px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-semibold">
              What &ldquo;available&rdquo; actually means in {name}
            </h2>
            <p className="text-muted-foreground md:text-lg">
              Four checks, four different authorities. The state runs one of
              them.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {LAYERS.map(([term, detail], i) => (
              <article
                key={term}
                className="space-y-2 border border-primary/20 bg-sidebar/50 px-4 py-5"
              >
                <p className="font-heading text-xs font-bold text-primary uppercase">
                  Check {i + 1}
                </p>
                <h3 className="font-heading text-xl font-medium">{term}</h3>
                <p className="text-sm text-muted-foreground">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* The order to run them in. */}
      <section className="border-b px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-semibold">
              How to check business name availability in {name}
            </h2>
            <p className="text-muted-foreground md:text-lg">
              Four steps, cheapest first — the state filing comes last, after
              the name has survived everything else.
            </p>
          </div>
          <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[
              [
                `Search the ${name} registry`,
                `Look up your exact name and close variants in the ${abbr} business registry before anything else. If it is already on record, everything below is moot.`,
              ],
              [
                "Check the domain and the handles",
                "Run the name through a live check: .com registration and the major social platforms, in seconds, with the receipts for each result.",
              ],
              [
                "Ask the AI models what it means",
                "Type the name into GPT, Claude and Perplexity. If any of them already answers with something else, the name is haunted before you launch.",
              ],
              [
                `File in ${name}, claim the domain yourself`,
                `The state filing is yours to make, and so is the registration. We tell you the name is open; you own it in your own name.`,
              ],
            ].map(([step, detail], i) => (
              <li
                key={step}
                className="space-y-2 border border-primary/20 bg-sidebar/50 px-4 py-5"
              >
                <p className="font-heading text-xs font-bold text-primary uppercase">
                  Step {i + 1}
                </p>
                <h3 className="font-heading text-xl font-medium">{step}</h3>
                <p className="text-sm text-muted-foreground">{detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The check itself. */}
      <section className="border-b px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-4 sm:text-center">
          <h2 className="font-heading text-2xl font-semibold">
            Is this name taken in {name}? Run the checks the registry
            doesn&rsquo;t.
          </h2>
          <p className="mx-auto max-w-prose text-muted-foreground md:text-lg">
            The first check on every name is free, forever. Live .com lookups,
            GitHub, X, Instagram, TikTok and YouTube, and GPT, Claude and
            Perplexity collision checks — each with the evidence, run the moment
            you ask.
          </p>
          <Button size="lg" className="h-auto px-8 py-5 text-lg" asChild>
            <Link href="/?mode=name">Check a name now</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Have more than a name?{" "}
            <Link href="/?mode=idea" className="underline underline-offset-4">
              Describe the idea
            </Link>{" "}
            and every candidate arrives checked the same way.
          </p>
        </div>
      </section>

      {/* Keep the cluster crawlable and the reader one hop from home. */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-4 sm:text-center">
          <h2 className="font-heading text-2xl font-semibold">
            Other states
          </h2>
          <p className="text-muted-foreground md:text-lg">
            The process is the same in every state; the registry is not.{" "}
            <Link
              href="/business-name-availability"
              className="underline underline-offset-4"
            >
              All states
            </Link>
          </p>
          <ul className="flex flex-wrap justify-start gap-2 sm:justify-center">
            {US_STATES.filter((s) => s.slug !== state.slug)
              .slice(0, 12)
              .map((s) => (
                <li key={s.slug}>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/business-name-availability/${s.slug}`}>
                      {s.name}
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
