import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { JsonLd } from "@/components/app/json-ld"
import Matrix from "@/components/ideas/matrix"
import NameCard from "@/components/ideas/name-card"
import OwnerCard from "@/components/ideas/owner-card"
import ReportButton from "@/components/ideas/report-button"
import ScoreBars from "@/components/ideas/score-bars"
import SurvivalFunnel from "@/components/ideas/funnel"
import PrompterCta from "@/components/public/prompter-cta"
import { FaqItem, FaqList } from "@/components/ui/faq-list"
import { Button } from "@/components/ui/button"
import {
  analyze,
  checkedLabel,
  count,
  getIdeaPage,
  STAGE_LABEL,
  verdictLine,
} from "@/lib/ideas"
import { SITE_NAME, SITE_URL } from "@/lib/site"

// Cached and served from the edge: the page reads no cookies, and the
// data layer revalidates every five minutes, or at once when the owner
// publishes, updates or unpublishes.
export const revalidate = 300

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await getIdeaPage(slug)
  if (!page) return { robots: { index: false, follow: false } }
  const story = analyze(page.names)
  const description = `${story.headline} ${story.lede} Checked against live .com registration, social handles and what ChatGPT, Claude and Perplexity already say.`
  const url = `${SITE_URL}/ideas/${page.slug}`
  return {
    title: `${page.title}: ${story.headline}`,
    description,
    alternates: { canonical: `/ideas/${page.slug}` },
    openGraph: {
      title: `${page.title}: ${story.headline}`,
      description,
      url,
      type: "article",
      publishedTime: page.published_at ?? undefined,
      modifiedTime: page.updated_at,
    },
    twitter: { card: "summary_large_image" },
  }
}

function faqFor(
  page: NonNullable<Awaited<ReturnType<typeof getIdeaPage>>>,
  story: ReturnType<typeof analyze>
): { question: string; answer: string }[] {
  const items: { question: string; answer: string }[] = []
  const best = story.best
  if (best) {
    items.push({
      question: `Which name scored highest for ${page.title}?`,
      answer: `${best.name.name} scored ${best.name.score} out of 100. ${verdictLine(best)}`,
    })
  }
  items.push({
    question: `How many of the ${count(story.funnel.total)} names survived every check?`,
    answer: `${story.headline} ${story.lede}`.trim(),
  })
  if (story.trap) {
    items.push({
      question: `Why did ${story.trap.name.name} fail when its domain and handles were free?`,
      answer: `${verdictLine(story.trap)} A free domain does not help if people searching for you are shown a different brand.`,
    })
  }
  if (best && best.com !== null) {
    items.push({
      question: `Is the .com available for ${best.name.name}?`,
      answer: best.com
        ? `Yes, the .com for ${best.name.name} was free when it was checked on ${checkedLabel(page.checked_at)}. Domains can be registered at any moment, so check again before you buy.`
        : `No, the .com for ${best.name.name} was already registered when it was checked on ${checkedLabel(page.checked_at)}.`,
    })
  }
  items.push({
    question: "How were these names checked?",
    answer: `Each name was checked live against domain registries for several extensions, against social platforms for open handles, and put to ${
      page.models.length ? page.models.join(", ") : "AI chatbots"
    } to see whether they already link it to an existing brand. A name counts as a survivor only if its .com is free, none of its handles are taken, and no chatbot confuses it with another brand.`,
  })
  return items
}

export default async function IdeaPage({ params }: PageProps) {
  const { slug } = await params
  const page = await getIdeaPage(slug)
  if (!page || page.names.length === 0) notFound()

  const story = analyze(page.names)
  const { best, survivors, closest, trap } = story
  const url = `${SITE_URL}/ideas/${page.slug}`
  const faqs = faqFor(page, story)
  const checked = checkedLabel(page.checked_at)

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              "@id": `${url}#article`,
              mainEntityOfPage: url,
              headline: `${page.title}: ${story.headline}`,
              description: `${story.headline} ${story.lede}`,
              datePublished: page.published_at,
              dateModified: page.updated_at,
              inLanguage: "en",
              author: page.owner.named
                ? { "@type": "Person", name: page.owner.name }
                : { "@type": "Organization", name: SITE_NAME },
              publisher: { "@id": `${SITE_URL}/#organization` },
              about: page.brief,
            },
            {
              "@type": "ItemList",
              "@id": `${url}#names`,
              name: `Names tested for ${page.title}`,
              numberOfItems: page.names.length,
              itemListOrder: "https://schema.org/ItemListOrderDescending",
              itemListElement: page.names.map((entry, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: entry.name,
                description: `Scored ${entry.score} out of 100.`,
              })),
            },
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              mainEntity: faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: { "@type": "Answer", text: faq.answer },
              })),
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${url}#breadcrumb`,
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: SITE_URL,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Ideas",
                  item: `${SITE_URL}/ideas`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: page.title,
                  item: url,
                },
              ],
            },
          ],
        }}
      />

      <article>
        {/* The opening: whose idea, what we found, in one screen. */}
        <header className="border-b px-4 pt-10 pb-12 md:pt-16">
          <div className="mx-auto max-w-5xl space-y-8">
            <p className="flex flex-wrap items-center gap-x-2 text-[0.6875rem] font-semibold tracking-widest uppercase">
              <Link
                href="/ideas"
                className="text-muted-foreground hover:text-foreground"
              >
                Idea reports
              </Link>
              <span aria-hidden="true" className="text-muted-foreground">
                /
              </span>
              <span className="text-primary">Checked {checked}</span>
            </p>

            <div className="space-y-5">
              <h1 className="max-w-4xl font-heading text-4xl leading-[1.05] text-balance sm:text-5xl md:text-6xl">
                {page.title}
              </h1>
              <OwnerCard
                owner={page.owner}
                publishedAt={page.published_at}
                note={page.note}
              />
            </div>

            <div className="grid gap-8 border bg-card p-5 sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
              <div className="space-y-4">
                <p className="text-[0.6875rem] font-semibold tracking-widest text-primary uppercase">
                  What we found
                </p>
                <p className="font-heading text-3xl leading-tight text-balance sm:text-4xl">
                  {story.headline}
                </p>
                <p className="text-muted-foreground md:text-lg">{story.lede}</p>

                {survivors.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                      {survivors.length === 1
                        ? "The survivor"
                        : "The survivors"}
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {survivors.map((entry) => (
                        <li key={entry.name.id}>
                          <a
                            href={`#name-${entry.name.id}`}
                            className="inline-flex items-baseline gap-2 border border-primary bg-primary/5 px-3 py-1.5 transition-colors hover:bg-primary/10"
                          >
                            <span className="font-heading text-xl">
                              {entry.name.name}
                            </span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {entry.name.score}/100
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : closest ? (
                  <p className="border-l-2 border-amber-500 pl-3 text-sm">
                    The closest call was{" "}
                    <a
                      href={`#name-${closest.name.id}`}
                      className="font-medium underline underline-offset-4"
                    >
                      {closest.name.name}
                    </a>
                    , which lost only because{" "}
                    {closest.failures
                      .map((stage) => STAGE_LABEL[stage])
                      .join(" and ")}
                    .
                  </p>
                ) : null}
              </div>
              <SurvivalFunnel funnel={story.funnel} />
            </div>
          </div>
        </header>

        {/* Proof for the skeptic: every name, every check, one grid. */}
        <section className="px-4 py-12 md:py-16">
          <div className="mx-auto max-w-5xl space-y-12">
            <div className="min-w-0 space-y-4">
              <h2 className="font-heading text-3xl">Every name, ranked</h2>
              <p className="text-sm text-muted-foreground">
                Average score {story.average}.{" "}
                {best ? `${best.name.name} led at ${best.name.score}. ` : ""}
                {story.comFree} of {story.funnel.total} had a free .com.
              </p>
              <ScoreBars facts={story.facts} />
            </div>
            <div className="min-w-0 space-y-4">
              <h2 className="font-heading text-3xl">
                Every check, side by side
              </h2>
              <p className="text-sm text-muted-foreground">
                Each row is one name. A name needs green on .com, on every
                handle, and on chatbots to survive.
              </p>
              <Matrix facts={story.facts} />
            </div>
          </div>
        </section>

        {/* The unusual part: a name that looked perfect and still lost. */}
        {trap ? (
          <section className="border-y bg-muted/40 px-4 py-12 md:py-16">
            <div className="mx-auto max-w-3xl space-y-4">
              <p className="text-[0.6875rem] font-semibold tracking-widest text-primary uppercase">
                The one that looked perfect
              </p>
              <h2 className="font-heading text-3xl text-balance sm:text-4xl">
                {trap.name.name} had a free domain and open handles. Then we
                asked the chatbots.
              </h2>
              {story.quotes.length > 0 &&
              story.quotes[0].name === trap.name.name ? (
                <ul className="space-y-3">
                  {story.quotes.map((quote) => (
                    <li
                      key={quote.ai.model}
                      className="border-l-2 border-primary pl-4"
                    >
                      <p className="text-lg text-pretty">
                        &ldquo;{quote.ai.association}&rdquo;
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {quote.ai.model}
                        {quote.ai.confidence !== null
                          ? `, ${quote.ai.confidence} out of 100 overlap`
                          : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">{verdictLine(trap)}</p>
              )}
              <p className="text-sm text-muted-foreground">
                People now ask chatbots before they search. If a chatbot already
                ties your name to another company, that is who gets recommended.
              </p>
            </div>
          </section>
        ) : null}

        {/* First ask, while they are most convinced. */}
        <section className="px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <h2 className="font-heading text-3xl text-balance sm:text-4xl">
              Got an idea of your own? See how its names hold up.
            </h2>
            <p className="text-muted-foreground">
              Type one name and get the same checks in seconds, free, no account
              needed.
            </p>
            <div className="overflow-hidden"><PrompterCta /></div>
          </div>
        </section>

        <section className="border-t px-4 py-12 md:py-16">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="space-y-2">
              <h2 className="font-heading text-3xl sm:text-4xl">
                The names, one by one
              </h2>
              <p className="max-w-prose text-muted-foreground">
                Why each name passed or failed, what is free to register, and
                what each chatbot said when asked about it.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {story.facts.map((entry, index) => (
                <NameCard key={entry.name.id} entry={entry} rank={index + 1} />
              ))}
            </div>
            {page.hidden_count > 0 ? (
              <p className="text-sm text-muted-foreground">
                {page.hidden_count}{" "}
                {page.hidden_count === 1 ? "name was" : "names were"} left off
                at the owner&apos;s request.
              </p>
            ) : null}
          </div>
        </section>

        <section className="border-t bg-muted/40 px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl space-y-4">
            <h2 className="font-heading text-3xl">
              How we checked, and what to trust
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <strong className="text-foreground">Domains:</strong> looked up
                live at the registry for each extension, not guessed from a
                cached list.
              </li>
              <li>
                <strong className="text-foreground">Handles:</strong> each
                platform&apos;s own profile page was checked for the exact
                handle.
              </li>
              <li>
                <strong className="text-foreground">Chatbots:</strong> asked
                what {page.models.length ? page.models.join(", ") : "AI models"}{" "}
                already associate with each name. A score of {30} or more means
                the model described another brand.
              </li>
              <li>
                <strong className="text-foreground">Timing:</strong> everything
                here was true on {checked}. Domains and handles can be taken at
                any moment, so check again before you commit.
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Don&apos;t take our word for it: open any name and run the check
              yourself.
            </p>
          </div>
        </section>

        <section className="border-t px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl space-y-5">
            <h2 className="font-heading text-3xl">Questions people ask</h2>
            <FaqList>
              {faqs.map((faq) => (
                <FaqItem key={faq.question} question={faq.question}>
                  <p>{faq.answer}</p>
                </FaqItem>
              ))}
            </FaqList>
          </div>
        </section>

        <section className="border-t bg-primary/5 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl space-y-5 text-center">
            <p className="text-[0.6875rem] font-semibold tracking-widest text-primary uppercase">
              Your turn
            </p>
            <h2 className="font-heading text-4xl text-balance sm:text-5xl">
              Find out which of your names survives.
            </h2>
            <p className="text-muted-foreground md:text-lg">
              Describe your idea and four naming studios suggest names. Every
              one is checked live for domains, handles and chatbot confusion
              before you see it.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild size="lg">
                <Link
                  href={`/?mode=idea&brief=${encodeURIComponent(page.brief)}`}
                >
                  Run this same idea
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/">Check my own name</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Three free searches a month. No card needed.
            </p>
          </div>
        </section>

        <footer className="border-t px-4 py-6">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              Published by a member of {SITE_NAME}. Results checked {checked}.
            </span>
            <ReportButton slug={page.slug} />
          </div>
        </footer>
      </article>
    </>
  )
}
