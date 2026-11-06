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
          text: `There are two checks here, with two different authorities behind them. The legal name, the one on your ${name} (${abbr}) entity filing, is decided by the state's business registry, so search it for your exact name and any close variants before you file. The rest of the name is decided somewhere else entirely: whether the .com is open, whether the handles are free on GitHub, X, Instagram, TikTok and YouTube, and what GPT, Claude and Perplexity already associate with the name. Run those in one check before you fall for the name.`,
        },
      },
      {
        "@type": "Question",
        name: `Does the ${name} business registry check domains and social handles?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `No. The ${name} registry answers one question, which is whether this entity name is distinguishable from names already on record. A name can be approved by the state and still have a taken .com, no free handles, and a meaning in every AI model's head, and that is exactly the gap this check fills.`,
        },
      },
      {
        "@type": "Question",
        name: `Can I reserve a business name in ${name} before I file?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Most states let you reserve or hold a name for a while before you file, but the rules and fees belong to the registry and they do change, so check with ${name}'s registry before counting on one. A reservation only holds the entity name. It does nothing for the domain, the handles or the AI associations, and those are exactly the things that get claimed while you wait.`,
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
    "Nobody at the registry is going to look up the .com for you. A live lookup tells you in seconds whether it is still open, checked right now rather than cached, because a name whose domain is taken is a name you cannot fully own.",
  ],
  [
    "The handles",
    "That means GitHub, X, Instagram, TikTok and YouTube. A brand that cannot get its own name on the platforms starts every launch by explaining why it spells the name differently.",
  ],
  [
    "The AI associations",
    "Ask GPT, Claude and Perplexity what the name already means. If they already have an answer, you have a problem that no domain search and no registry will ever catch. It is the check nobody else runs.",
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
            People usually mean two different things when they ask whether a
            business name is available, and only one of them is the
            state&rsquo;s business. The {name} registry answers the legal
            question, which is whether this entity name is already on record in{" "}
            {abbr}. The rest is up to you: whether the .com is still open,
            whether the handles are free, and what the chatbots already think
            the name means. Here is how to answer all of it before you file
            anything.
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
              Four checks, four different authorities, and the state runs only
              one of them.
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
              Four steps, cheapest first, with the state filing at the end,
              once the name has survived everything else.
            </p>
          </div>
          <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[
              [
                `Search the ${name} registry`,
                `Look up your exact name and close variants in the ${abbr} business registry before anything else. If it is already on record, nothing else on this list matters.`,
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
            The first check on every name is free, forever. You get live .com
            lookups, GitHub, X, Instagram, TikTok and YouTube, and GPT, Claude
            and Perplexity collision checks, and every result comes with the
            evidence behind it.
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
            The process is the same in every state, but the registry is
            different in each one.{" "}
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
