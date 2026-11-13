import type { Metadata } from "next"
import Link from "next/link"
import { SectionHeader } from "@/components/public/section-header"
import {
  ChatGptGrowthChart,
  DisputeFilingsChart,
  DomainGrowthChart,
} from "@/components/about/charts"
import CountUp from "@/components/about/count-up"
import GsapReveal from "@/components/about/gsap-reveal"
import PrompterCta from "@/components/public/prompter-cta"
import LetterField from "@/components/fields/letter-field"
import RegistryField from "@/components/fields/registry-field"
import { JsonLd } from "@/components/app/json-ld"
import { PRO_PRICE, pageMetadata, SITE_NAME, SITE_URL } from "@/lib/site"
import { cn } from "@/lib/utils"

export const metadata: Metadata = pageMetadata({
  title: "About us",
  description:
    "Why we built a name checker for the age of AI: 401.6 million domains are registered, name disputes hit a record 6,282 last year, and 900 million people ask ChatGPT about everything, including whatever your name already means.",
  path: "/about",
})

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": `${SITE_URL}/about#about`,
  url: `${SITE_URL}/about`,
  name: `About ${SITE_NAME}`,
  description:
    "Unclaimed by AI checks whether the name you want is free as a domain, as a social handle, and as an idea in the heads of the AI models people ask first.",
  mainEntity: {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
  },
}

const PRINCIPLES = [
  {
    index: "01",
    title: "Live, not cached",
    body: "Domain availability comes straight from RDAP, the protocol registrars use internally, seconds before you see it. If we said it's open, it was open.",
  },
  {
    index: "02",
    title: "Honest about limits",
    body: "Where an exact answer doesn't exist (X and Instagram have no public API for this), we label the result a best guess. A truthful maybe beats a fake green checkmark.",
  },
  {
    index: "03",
    title: "The check nobody else runs",
    body: "Every name gets asked to GPT, Claude, and Perplexity independently. If a chatbot already has an answer for it, you deserve to know before you print the logo.",
  },
  {
    index: "04",
    title: "Free where it matters",
    body: `The first check on every name is free, forever. Credits buy depth when you need it and never expire. If you live in the tool, Pro adds sandboxes, searches and the watchlist for $${PRO_PRICE} a month. Cancel from the billing page, no phone call.`,
  },
]

function Chapter({
  kicker,
  title,
  accent,
  source,
  chart,
  reverse = false,
  tinted = false,
  children,
}: {
  kicker: string
  title: string
  accent: string
  source: string
  chart: React.ReactNode
  reverse?: boolean
  tinted?: boolean
  children: React.ReactNode
}) {
  return (
    <section
      className={cn(
        "border-b px-4 py-20 md:py-28",
        tinted && "bg-sidebar"
      )}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 md:gap-20">
        <GsapReveal className={cn("space-y-6", reverse && "md:order-2")}>
          <SectionHeader
            align="start"
            eyebrow={kicker}
            title={title}
            accent={accent}
          />
          <div className="max-w-prose space-y-4 text-base leading-7 sm:text-lg">
            {children}
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            Source: {source}
          </p>
        </GsapReveal>
        <GsapReveal y={32} className={cn(reverse && "md:order-1")}>
          {chart}
        </GsapReveal>
      </div>
    </section>
  )
}

const NUMBERS = [
  {
    label: "Domains registered",
    value: 401.6,
    decimals: 1,
    suffix: "M",
    caption: "names already parked across every TLD",
  },
  {
    label: "Name disputes, 2025",
    value: 6282,
    decimals: 0,
    suffix: "",
    caption: "cybersquatting cases at WIPO, a record",
  },
  {
    label: "Ask ChatGPT weekly",
    value: 900,
    decimals: 0,
    suffix: "M",
    caption: "people inheriting what the model believes",
  },
]

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutJsonLd} />

      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b px-4 pt-16 pb-14 md:pt-24">
        <RegistryField quiet />
        <div className="mx-auto max-w-7xl space-y-14">
          <SectionHeader
            as="h1"
            eyebrow="About us"
            title="We built the checker"
            accent="we needed ourselves."
            lede={`${SITE_NAME} exists because naming something in 2026 means clearing three land grabs at once, and nobody was selling a map.`}
          />
          <div
            data-field-avoid
            className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3"
          >
            {NUMBERS.map((number) => (
              <article
                key={number.label}
                data-reveal
                className="flex flex-col gap-3 bg-background p-6 sm:p-8"
              >
                <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-primary uppercase">
                  {number.label}
                </p>
                <p className="font-heading text-6xl leading-none tabular-nums sm:text-7xl">
                  <CountUp
                    value={number.value}
                    decimals={number.decimals}
                    suffix={number.suffix}
                  />
                </p>
                <p className="text-sm text-muted-foreground">
                  {number.caption}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* The story */}
      <section className="border-b px-4 py-20 md:py-28">
        <GsapReveal className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              align="start"
              eyebrow="The story"
              title="Arithmetic on"
              accent="a moving train."
            />
          </div>
          <div className="space-y-6 text-lg leading-8 sm:text-xl sm:leading-9">
            <p className="first-letter:float-left first-letter:me-3 first-letter:font-heading first-letter:text-7xl first-letter:leading-[0.85] first-letter:text-primary">
              We picked a name for our own thing the hard way, typing candidates
              into a registrar tab, a handle checker tab, and a chatbot window,
              then trying to hold three maybe-answers in our head at once.
            </p>
            <p className="text-muted-foreground">
              The frustrating part wasn&apos;t the work. It was realizing the
              third check, the AI one, was the one that mattered most and
              existed nowhere. Domain tools told us about domains. Handle tools
              told us about handles. Nothing told us whether the name already{" "}
              <em>meant</em> something to the models a billion people ask every
              day.
            </p>
            <p className="text-muted-foreground">
              So that&apos;s the whole company, really: three checks in one
              pass, run live, labeled honestly, priced like a one-time problem.
              Generate the names, see what&apos;s actually free, and claim yours
              before someone&apos;s chatbot already has it.
            </p>
          </div>
        </GsapReveal>
      </section>

      <Chapter
        kicker="The first land grab"
        title="Every year,"
        accent="the namespace shrinks."
        source="Verisign Domain Name Industry Brief, Q2 2026. Selected quarter-ends, all TLDs."
        chart={<DomainGrowthChart />}
      >
        <p>
          The internet passed{" "}
          <strong>400 million registered domain names</strong> in mid-2026. The
          good two-word .coms ran out long ago; the gold-rush pace of the last
          two years, up 8.1% year over year, is mostly everyone else racing to
          park names before you do.
        </p>
      </Chapter>

      <Chapter
        kicker="The fight over names"
        title="When a name matters,"
        accent="people fight over it."
        source="WIPO Arbitration and Mediation Center, annual UDRP and ccTLD case filings."
        chart={<DisputeFilingsChart />}
        reverse
        tinted
      >
        <p>
          WIPO&apos;s cybersquatting docket set its{" "}
          <strong>all-time record in 2025</strong>: 6,282 cases, on top of
          three straight record-ish years before it. Pick a name that brushes
          against someone else&apos;s mark and this chart is where you end up.
        </p>
      </Chapter>

      <Chapter
        kicker="The second land grab"
        title="Now there's a land grab"
        accent="inside people's heads."
        source="OpenAI figures reported by TechCrunch, The Verge, CNBC, and Business Insider, Nov 2023 to Feb 2026."
        chart={<ChatGptGrowthChart />}
      >
        <p>
          <strong>900 million people</strong> ask ChatGPT something every
          week, four times the count of two years ago. Whatever a model already
          associates with your name, that&apos;s what it tells all of them. No
          domain search on earth catches that collision. So we run it: three
          models, one question, independent answers.
        </p>
      </Chapter>

      {/* Principles */}
      <section className="border-b px-4 py-20 md:py-28">
        <div className="mx-auto max-w-7xl space-y-12">
          <SectionHeader
            eyebrow="How we build"
            title="Four rules we argue about"
            accent="so you don't have to."
          />
          <GsapReveal
            stagger={0.08}
            className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2"
          >
            {PRINCIPLES.map((principle) => (
              <article
                key={principle.index}
                data-reveal
                className="space-y-3 bg-background p-6 md:p-10"
              >
                <p className="font-heading text-5xl leading-none text-primary/40 italic">
                  {principle.index}
                </p>
                <h3 className="font-heading text-3xl">{principle.title}</h3>
                <p className="leading-7 text-muted-foreground">
                  {principle.body}
                </p>
              </article>
            ))}
          </GsapReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden px-4 py-20 md:py-28">
        <LetterField mode="claim" quiet fade="both" />
        <div className="mx-auto max-w-4xl space-y-10">
          <SectionHeader
            eyebrow="Your turn"
            title="See it work"
            accent="on your name."
            lede="The first check on every name is free. No card, no subscription, no catch."
          />
          <div data-field-avoid>
            <PrompterCta />
          </div>
          <p
            data-field-avoid
            className="mx-auto w-fit text-center text-sm text-muted-foreground"
          >
            Questions for us?{" "}
            <Link href="/contact" className="text-primary underline underline-offset-4">
              Write in
            </Link>
            . A human reads every message.
          </p>
        </div>
      </section>
    </>
  )
}
