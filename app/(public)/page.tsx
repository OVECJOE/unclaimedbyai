import type { Metadata } from "next"
import Hero from "@/components/landing/hero"
import VerdictSpecimen from "@/components/landing/verdict-specimen"
import LandGrabs from "@/components/landing/land-grabs"
import Suite from "@/components/landing/suite"
import LiveFeed from "@/components/landing/live-feed"
import PricingTeaser from "@/components/landing/pricing-teaser"
import FaqTeaser, { LANDING_FAQS } from "@/components/landing/faq-teaser"
import IdeaReports from "@/components/landing/idea-reports"
import FinalCta from "@/components/landing/final-cta"
import BlogCarousel from "@/components/public/blog-carousel"
import CompareTable from "@/components/public/compare-table"
import { SectionHeader } from "@/components/public/section-header"
import GsapReveal from "@/components/about/gsap-reveal"
import { JsonLd } from "@/components/app/json-ld"
import { homeJsonLd, pageMetadata, SITE_URL } from "@/lib/site"
import { getMeServer } from "@/lib/api-server"
import { loadRealSpecimens } from "@/lib/landing-reports"

// The schema mirrors what the page shows: the six landing questions,
// not the product page's full set.
const faqJsonLdData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/#faq`,
  mainEntity: LANDING_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}

export const metadata: Metadata = pageMetadata({
  title: "Name checker: is this name taken?",
  description:
    "Check any name against live .com registration, real social handles, and what GPT, Claude, and Perplexity already associate with it, all before you register. No name yet? Four naming studios generate a scored shortlist, and every name in it gets checked the same way. The first check on every name is free.",
  path: "/",
})

export default async function Page() {
  const [user, specimens] = await Promise.all([
    getMeServer().catch(() => null),
    loadRealSpecimens(4),
  ])
  const signedIn = Boolean(user)

  // Real names from recent checks, hidden in the letter fields.
  const fieldNames = specimens.flatMap((specimen) => [
    specimen.name,
    ...(specimen.shortlist ?? []).map((item) => item.name),
  ])

  return (
    <>
      <JsonLd data={homeJsonLd} />
      <JsonLd data={faqJsonLdData} />

      {/* Order follows the visitor's questions, not a template: what
          is this (hero, with a real result), why does it matter, what
          exactly do I get, what else is there, is it real, how does it
          compare, what does it cost. */}
      <Hero signedIn={signedIn} names={fieldNames} />
      <LandGrabs />

      <section className="border-b px-4 py-20 md:py-28">
        <div className="mx-auto max-w-7xl space-y-12">
          <SectionHeader
            eyebrow="One name, three answers"
            title="Three answers for every name."
            lede="Is the website address free? Are the social media usernames free? And what do AI chatbots already say the name means? Click through a few names, then try your own."
          />
          <GsapReveal y={32}>
            <VerdictSpecimen specimens={specimens} />
          </GsapReveal>
        </div>
      </section>

      <Suite latest={specimens[0] ?? null} />
      <LiveFeed />

      <section className="border-b px-4 py-20 md:py-28">
        <div className="mx-auto max-w-7xl space-y-12">
          <SectionHeader
            eyebrow="The honest comparison"
            title="Close"
            accent="the other tabs."
            lede="A name generator, a domain search and a lawyer's trademark search each cover a piece. Here's what they leave out, next to a single check."
          />
          <GsapReveal y={24}>
            <CompareTable />
          </GsapReveal>
        </div>
      </section>

      <IdeaReports />
      <PricingTeaser signedIn={signedIn} />
      <BlogCarousel />
      <FaqTeaser />
      <FinalCta signedIn={signedIn} names={fieldNames} />
    </>
  )
}
