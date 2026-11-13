import { HugeiconsIcon } from "@hugeicons/react"
import { FaqItem, FaqList } from "@/components/ui/faq-list"
import PrompterCta from "@/components/public/prompter-cta"
import LetterField from "@/components/fields/letter-field"
import CompareTable from "@/components/public/compare-table"
import { SectionHeader, TONE } from "@/components/public/section-header"
import VerdictSpecimen from "@/components/landing/verdict-specimen"
import GsapReveal from "@/components/about/gsap-reveal"
import type { Metadata } from "next"
import { JsonLd } from "@/components/app/json-ld"
import { SITE_NAME, SITE_URL, offersJsonLd, pageMetadata } from "@/lib/site"
import { cn } from "@/lib/utils"
import { loadRealSpecimens } from "@/lib/landing-reports"
import {
  DOMAIN_STATUSES,
  FAQS,
  PROOF_POINTS,
  SOCIAL_HANDLES,
} from "./constants"

export const metadata: Metadata = pageMetadata({
  title: "What happens when you hit check?",
  description:
    "No black box. Live RDAP domain checks, exact social handle checks, and independent AI association checks across GPT, Claude, and Perplexity, with the receipts for each one.",
  path: "/product",
})

const productJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/product#app`,
      name: `${SITE_NAME} name checker`,
      url: `${SITE_URL}/product`,
      description:
        "No black box, no made-up score. Three real checks for a name: live RDAP domain lookups, exact social handle checks, and independent AI association checks across GPT, Claude, and Perplexity.",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Name checker",
      operatingSystem: "Web",
      inLanguage: "en",
      featureList: [
        "Live RDAP domain checks across .com, .ai, .io, and .co",
        "Exact social handle checks through public APIs",
        "Independent AI association checks across GPT, Claude, and Perplexity",
      ],
      offers: offersJsonLd,
      provider: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/product#faq`,
      mainEntity: FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/product#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: { "@type": "WebPage", name: "Home", url: SITE_URL },
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Product",
          item: {
            "@type": "WebPage",
            name: "Product",
            url: `${SITE_URL}/product`,
          },
        },
      ],
    },
  ],
}

function Receipt({
  path,
  children,
}: {
  path: string
  children: React.ReactNode
}) {
  return (
    <div className="border bg-background">
      <div className="flex items-center justify-between gap-3 border-b bg-sidebar px-4 py-2.5">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2.5 bg-border" />
          <span className="size-2.5 bg-border" />
          <span className="size-2.5 bg-border" />
        </div>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {path}
        </p>
      </div>
      <div className="p-5 font-mono text-sm sm:p-6">{children}</div>
    </div>
  )
}

function Chapter({
  kicker,
  title,
  accent,
  receipt,
  reverse = false,
  children,
}: {
  kicker: string
  title: string
  accent: string
  receipt: React.ReactNode
  reverse?: boolean
  children: React.ReactNode
}) {
  return (
    <article className="grid items-center gap-10 py-16 md:grid-cols-2 md:gap-16 md:py-24">
      <GsapReveal className={cn("space-y-5", reverse && "md:order-2")}>
        <SectionHeader
          align="start"
          eyebrow={kicker}
          title={title}
          accent={accent}
        />
        <div className="max-w-prose space-y-4 text-base leading-7 text-muted-foreground sm:text-lg">
          {children}
        </div>
      </GsapReveal>
      <GsapReveal y={32} className={cn(reverse && "md:order-1")}>
        {receipt}
      </GsapReveal>
    </article>
  )
}

export default async function ProductPage() {
  const specimens = await loadRealSpecimens(4)
  return (
    <>
      <JsonLd data={productJsonLd} />

      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b px-4 pt-16 pb-14 md:pt-24">
        <LetterField quiet />
        <div className="mx-auto max-w-7xl space-y-14">
          <SectionHeader
            as="h1"
            eyebrow="How checks work"
            title={
              <>
                {/* The slogan alone names no entity; the screen-reader
                    prefix gives the heading the brand and category that
                    crawlers and assistive tech both key on. */}
                <span className="sr-only">
                  Unclaimed by AI, the name checker:{" "}
                </span>
                What actually happens when you hit
              </>
            }
            accent="“check”?"
            lede="No black box and no made-up score. Three real checks run while you watch, and each one comes with its receipts."
          />

          <div
            data-field-avoid
            className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3"
          >
            {PROOF_POINTS.map((point) => (
              <div
                key={point.label}
                className="flex flex-col gap-4 bg-background p-6 sm:p-8"
              >
                <div className="flex items-center gap-2 font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-primary uppercase">
                  {point.live ? (
                    <span aria-hidden className="relative flex size-2">
                      <span className="absolute inline-flex size-full bg-green-600 opacity-75 motion-safe:animate-ping" />
                      <span className="relative inline-flex size-2 bg-green-600" />
                    </span>
                  ) : null}
                  {point.label}
                </div>
                <p className="font-heading text-8xl leading-none">
                  {point.value}
                </p>
                <p className="text-muted-foreground">{point.caption}</p>
                <ul className="mt-auto flex flex-wrap gap-1.5">
                  {point.chips.map((chip) => (
                    <li
                      key={chip}
                      className="border border-dashed border-primary/30 bg-primary/5 px-2 py-1 font-mono text-xs text-primary"
                    >
                      {chip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The three checks, one chapter each */}
      <section className="border-b px-4">
        <div className="mx-auto max-w-7xl divide-y">
          <Chapter
            kicker="Domains"
            title="Checked live,"
            accent="not cached."
            receipt={
              <Receipt path="rdap · vantis">
                <div className="space-y-3">
                  {DOMAIN_STATUSES.map((row) => (
                    <div
                      key={row.domain}
                      className="flex items-center justify-between gap-4"
                    >
                      <span>{row.domain}</span>
                      <span
                        className={row.available ? TONE.open : TONE.taken}
                      >
                        {row.available ? "open" : "taken"}
                      </span>
                    </div>
                  ))}
                  <p className="border-t pt-3 text-xs text-muted-foreground">
                    answered by the registry · seconds ago
                  </p>
                </div>
              </Receipt>
            }
          >
            <p>
              We check .com, .ai, .io and .co through RDAP, the protocol
              registrars use internally, not a WHOIS mirror that might be three
              months stale.
            </p>
            <p>
              If we say a domain is open, it was open a few seconds ago. We
              can&apos;t hold it for you, so when you settle on a name, register
              it soon.
            </p>
          </Chapter>

          <Chapter
            kicker="Social handles"
            title="Checked honestly,"
            accent="labeled plainly."
            reverse
            receipt={
              <Receipt path="handles · vantis">
                <div className="space-y-3">
                  {SOCIAL_HANDLES.map((row) => (
                    <div
                      key={row.handle}
                      className="flex items-center justify-between gap-4"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <HugeiconsIcon
                          icon={row.icon}
                          className="size-4 shrink-0 text-muted-foreground"
                        />
                        <span className="truncate">{row.handle}</span>
                      </span>
                      <span className="shrink-0 text-xs">
                        <span className={row.open ? TONE.open : TONE.taken}>
                          {row.open ? "open" : "taken"}
                        </span>
                        <span className="text-muted-foreground"> · </span>
                        <span className={row.exact ? TONE.open : TONE.warn}>
                          {row.exact ? "exact" : "best guess"}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </Receipt>
            }
          >
            <p>
              GitHub has a public API that gives a straight yes or no, so those
              results are exact. X, Instagram, TikTok and YouTube don&apos;t
              offer one, so we load the live profile page and label the answer
              a best guess.
            </p>
            <p>
              We&apos;d rather tell you where the limit is than show you a
              green checkmark we can&apos;t back up.
            </p>
          </Chapter>

          <Chapter
            kicker="AI memory"
            title="The check"
            accent="nobody else runs."
            receipt={
              <Receipt path="ask · gpt · claude · perplexity">
                <p className="mb-4 text-xs text-muted-foreground">
                  &ldquo;What is Vantis?&rdquo; asked cold, with no hint about
                  your idea.
                </p>
                <div className="grid gap-px border bg-border">
                  <div className="space-y-1 bg-background p-4">
                    <p className={cn("text-[0.6875rem] uppercase", TONE.open)}>
                      Shrug
                    </p>
                    <p className="font-sans">
                      A children&apos;s book character from 1995
                    </p>
                  </div>
                  <div className="space-y-1 bg-background p-4">
                    <p className={cn("text-[0.6875rem] uppercase", TONE.taken)}>
                      Rethink the name
                    </p>
                    <p className="font-sans">
                      A live SaaS company in your exact category
                    </p>
                  </div>
                </div>
              </Receipt>
            }
          >
            <p>
              More people now ask ChatGPT, Claude and Perplexity to explain and
              recommend products. If a model already ties your name to another
              business, it will hand that business your reviews, your pricing
              and your reputation.
            </p>
            <p>
              So we ask three models the same question, separately, and show
              you what each one says. When they disagree, you see the split
              instead of an average.
            </p>
          </Chapter>
        </div>
      </section>

      {/* The whole report */}
      <section className="border-b bg-sidebar px-4 py-20 md:py-28">
        <div className="mx-auto max-w-7xl space-y-12">
          <SectionHeader
            eyebrow="Put together"
            title="One report,"
            accent="scored out of 100."
            lede="The three readings land on one page with a single score, so you can rank names against each other on the same terms. The evidence for every line stays one click away."
          />
          <VerdictSpecimen specimens={specimens} />
        </div>
      </section>

      {/* Comparison */}
      <section className="border-b px-4 py-20 md:py-28">
        <div className="mx-auto max-w-7xl space-y-12">
          <SectionHeader
            eyebrow="Where the others stop"
            title="A free generator"
            accent="stops at the idea."
            lede="Side by side with the free generators, a plain domain search and a lawyer's trademark search."
          />
          <CompareTable />
        </div>
      </section>

      {/* Frequently asked questions */}
      <section id="faq" className="scroll-mt-20 border-b px-4 py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              align="start"
              eyebrow={`${FAQS.length} questions`}
              title="Questions people"
              accent="actually ask."
            />
          </div>
          <FaqList className="border-t">
            {FAQS.map((faq) => (
              <FaqItem
                key={faq.id}
                question={faq.question}
                open={
                  faq.id === "what-does-unclaimedbyai-check-when-i-enter-a-name"
                }
              >
                {/* The schema keeps the plain answer; the row shows the
                    rich body when an entry earned one. */}
                {faq.body ?? faq.answer}
              </FaqItem>
            ))}
          </FaqList>
        </div>
      </section>

      {/* Prompt the visitor to check */}
      <section className="relative isolate overflow-hidden px-4 py-20 md:py-28">
        <LetterField mode="claim" quiet fade="both" />
        <div className="mx-auto max-w-4xl space-y-10">
          <SectionHeader
            eyebrow="Your turn"
            title="Type the name you're"
            accent="actually considering."
            lede="We'll tell you the truth about it in under a minute. The first check is free."
          />
          <div data-field-avoid>
            <PrompterCta />
          </div>
        </div>
      </section>
    </>
  )
}
