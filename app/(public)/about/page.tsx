import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  ChatGptGrowthChart,
  DisputeFilingsChart,
  DomainGrowthChart,
} from "@/components/about/charts"
import CountUp from "@/components/about/count-up"
import GsapReveal from "@/components/about/gsap-reveal"
import PrompterCta from "@/components/public/prompter-cta"
import { JsonLd } from "@/components/app/json-ld"
import { pageMetadata, SITE_NAME, SITE_URL } from "@/lib/site"

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
    body: "Every name gets asked to GPT, Claude, and Gemini independently. If a chatbot already has an answer for it, you deserve to know before you print the logo.",
  },
  {
    index: "04",
    title: "No subscriptions, ever",
    body: "Naming a company is a one-time problem. Charging monthly for a one-time problem is rude. Pay per report, keep your credits, no auto-renew button to hunt down.",
  },
]

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutJsonLd} />

      {/* Hero */}
      <section className="space-y-5 border-b px-4 py-10 sm:text-center">
        <Badge
          className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
          asChild
        >
          <p className="px-2 py-1 sm:px-3">About us</p>
        </Badge>
        <div className="space-y-3">
          <h1 className="mx-auto max-w-2xl font-heading text-4xl font-semibold md:text-5xl">
            We built the checker{" "}
            <span className="text-primary">we needed ourselves.</span>
          </h1>
          <p className="mx-auto max-w-prose md:text-lg">
            {SITE_NAME} exists because naming something in 2026 means clearing
            three land grabs at once, and nobody was selling a map.
          </p>
        </div>
      </section>

      {/* The three numbers that made us build this */}
      <section className="border-b px-4 py-10">
        <GsapReveal className="mx-auto max-w-7xl space-y-8">
          <div className="space-y-1 sm:text-center">
            <h2 className="font-heading text-2xl font-semibold md:text-3xl">
              Three numbers, one problem
            </h2>
            <p className="text-muted-foreground md:text-lg">
              Each one alone is a footnote. Together they&apos;re the reason a
              good name is harder to keep than ever.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
            <article
              data-reveal
              className="flex flex-col gap-3 bg-background p-5 sm:items-center sm:py-10 sm:text-center"
            >
              <p className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
                Domains registered
              </p>
              <p className="font-heading text-6xl leading-none text-primary sm:text-7xl">
                <CountUp value={401.6} decimals={1} suffix="M" />
              </p>
              <p className="text-sm text-muted-foreground sm:text-base">
                names already parked across every TLD, growing 8.1% in the last
                year alone
              </p>
            </article>
            <article
              data-reveal
              className="flex flex-col gap-3 bg-background p-5 sm:items-center sm:py-10 sm:text-center"
            >
              <p className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
                Name disputes, 2025
              </p>
              <p className="font-heading text-6xl leading-none text-primary sm:text-7xl">
                <CountUp value={6282} />
              </p>
              <p className="text-sm text-muted-foreground sm:text-base">
                cybersquatting cases filed at WIPO, the highest count in the
                policy&apos;s 25-year history
              </p>
            </article>
            <article
              data-reveal
              className="flex flex-col gap-3 bg-background p-5 sm:items-center sm:py-10 sm:text-center"
            >
              <p className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
                Ask ChatGPT weekly
              </p>
              <p className="font-heading text-6xl leading-none text-primary sm:text-7xl">
                <CountUp value={900} suffix="M" />
              </p>
              <p className="text-sm text-muted-foreground sm:text-base">
                people asking models questions, and inheriting whatever the
                model already believes about your name
              </p>
            </article>
          </div>
        </GsapReveal>
      </section>

      {/* Chart 1: domain growth */}
      <section className="border-b px-4 py-10 md:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-16">
          <GsapReveal className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground">01</span>
              <Badge className="font-heading text-xs text-primary">
                The first land grab
              </Badge>
            </div>
            <h2 className="font-heading text-2xl font-medium sm:text-3xl">
              Every year, the namespace shrinks
            </h2>
            <p className="max-w-prose text-base leading-7 sm:text-lg">
              The internet passed{" "}
              <strong>400 million registered domain names</strong> in mid-2026.
              The good two-word .coms ran out long ago; the gold-rush pace of
              the last two years, up 8.1% year over year, is mostly everyone
              else racing to park names before you do.
            </p>
            <p className="text-sm text-muted-foreground">
              Source: Verisign Domain Name Industry Brief, Q2 2026. Selected
              quarter-ends, all TLDs.
            </p>
          </GsapReveal>
          <GsapReveal y={32}>
            <DomainGrowthChart />
          </GsapReveal>
        </div>
      </section>

      {/* Chart 2: disputes */}
      <section className="border-b bg-primary/5 px-4 py-10 md:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-16">
          <GsapReveal className="space-y-3 md:order-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground">02</span>
              <Badge className="font-heading text-xs text-primary">
                The fight over names
              </Badge>
            </div>
            <h2 className="font-heading text-2xl font-medium sm:text-3xl">
              When a name matters this much, people fight over it
            </h2>
            <p className="max-w-prose text-base leading-7 sm:text-lg">
              WIPO&apos;s cybersquatting docket set its{" "}
              <strong>all-time record in 2025</strong>: 6,282 cases, on top of
              three straight record-ish years before it. Pick a name that
              brushes against someone else&apos;s mark and this chart is where
              you end up.
            </p>
            <p className="text-sm text-muted-foreground">
              Source: WIPO Arbitration and Mediation Center, annual UDRP and
              ccTLD case filings.
            </p>
          </GsapReveal>
          <GsapReveal y={32} className="md:order-1">
            <DisputeFilingsChart />
          </GsapReveal>
        </div>
      </section>

      {/* Chart 3: AI adoption */}
      <section className="border-b px-4 py-10 md:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-16">
          <GsapReveal className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground">03</span>
              <Badge className="font-heading text-xs text-primary">
                The second land grab
              </Badge>
            </div>
            <h2 className="font-heading text-2xl font-medium sm:text-3xl">
              Now there&apos;s a land grab inside people&apos;s heads
            </h2>
            <p className="max-w-prose text-base leading-7 sm:text-lg">
              <strong>900 million people</strong> ask ChatGPT something every
              week, four times the count of two years ago. Whatever a model
              already associates with your name, that&apos;s what it tells all
              of them. No domain search on earth catches that collision. So we
              run it: three models, one question, independent answers.
            </p>
            <p className="text-sm text-muted-foreground">
              Source: OpenAI figures reported by TechCrunch, The Verge, CNBC,
              and Business Insider, Nov 2023 to Feb 2026.
            </p>
          </GsapReveal>
          <GsapReveal y={32}>
            <ChatGptGrowthChart />
          </GsapReveal>
        </div>
      </section>

      {/* The story */}
      <section className="border-b px-4 py-10 md:py-16">
        <GsapReveal className="mx-auto max-w-3xl space-y-6">
          <div className="sm:text-center">
            <h2 className="font-heading text-2xl font-medium sm:text-3xl">
              So what did we actually do about it?
            </h2>
          </div>
          <div className="space-y-4 text-base leading-7 sm:text-lg">
            <p>
              We picked a name for our own thing the hard way, typing
              candidates into a registrar tab, a handle checker tab, and a
              chatbot window, then trying to hold three maybe-answers in our
              head at once. It felt like doing arithmetic on a moving train.
            </p>
            <p>
              The frustrating part wasn&apos;t the work. It was realizing the
              third check, the AI one, was the one that mattered most and
              existed nowhere. Domain tools told us about domains. Handle tools
              told us about handles. Nothing told us whether the name already{" "}
              <em>meant</em> something to the models a billion people ask every
              day.
            </p>
            <p>
              So that&apos;s the whole company, really: three checks in one
              pass, run live, labeled honestly, priced like a one-time problem.
              Generate the names, see what&apos;s actually free, and claim yours
              before someone&apos;s chatbot already has it.
            </p>
          </div>
        </GsapReveal>
      </section>

      {/* Principles */}
      <section className="border-b px-4 py-10 md:py-16">
        <GsapReveal className="mx-auto max-w-7xl space-y-8">
          <div className="space-y-1 sm:text-center">
            <h2 className="font-heading text-2xl font-semibold md:text-3xl">
              How we build
            </h2>
            <p className="text-muted-foreground md:text-lg">
              Four rules we argue about so you don&apos;t have to.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
            {PRINCIPLES.map((principle) => (
              <article
                key={principle.index}
                data-reveal
                className="space-y-2 bg-background p-5 md:p-8"
              >
                <p className="font-mono text-xs tracking-[0.12em] text-primary uppercase">
                  {principle.index}
                </p>
                <h3 className="font-heading text-xl font-medium md:text-2xl">
                  {principle.title}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground md:text-base">
                  {principle.body}
                </p>
              </article>
            ))}
          </div>
        </GsapReveal>
      </section>

      {/* CTA */}
      <section className="space-y-5 px-4 py-10 sm:text-center">
        <div className="space-y-2">
          <h2 className="font-heading text-3xl font-medium sm:text-4xl">
            See it work on your name.
          </h2>
          <p className="text-lg text-muted-foreground">
            First check on every name is free. No card, no subscription, no
            catch.
          </p>
        </div>
        <PrompterCta />
        <p className="text-sm text-muted-foreground">
          Questions for us?{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Write in
          </Link>{" "}
, a human reads every message.
        </p>
      </section>
    </>
  )
}
