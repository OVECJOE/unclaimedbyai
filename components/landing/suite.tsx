import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import GsapReveal from "@/components/about/gsap-reveal"
import { SectionHeader, TONE } from "@/components/public/section-header"
import type { Specimen } from "@/lib/landing-reports"
import { cn } from "@/lib/utils"

function scoreTone(score: number): string {
  if (score >= 80) return TONE.open
  if (score >= 60) return "text-primary"
  if (score >= 40) return TONE.warn
  return TONE.taken
}

/** A short piece of what the feature gives back, labelled honestly. */
function Picture({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="border bg-card">
      <p className="truncate border-b px-4 py-2.5 text-xs text-muted-foreground">
        {label}
      </p>
      <div className="p-4 font-mono text-[0.8125rem]">{children}</div>
    </div>
  )
}

function Feature({
  title,
  body,
  href,
  cta,
  children,
}: {
  title: string
  body: string
  href: string
  cta: string
  children: React.ReactNode
}) {
  return (
    <div
      data-reveal
      className="grid items-center gap-8 py-10 md:grid-cols-2 md:gap-16"
    >
      <div className="space-y-3">
        <h3 className="font-heading text-3xl leading-tight">{title}</h3>
        <p className="max-w-md text-muted-foreground">{body}</p>
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          {cta}
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
        </Link>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

const EXAMPLE_SHORTLIST = {
  query: "a budgeting app for creatives",
  names: [
    { name: "Ledgerly", score: 82 },
    { name: "Tallyfox", score: 77 },
    { name: "Brushbook", score: 64 },
    { name: "Inkwise", score: 39 },
  ],
}

const RESEARCH = [
  ["Competitors", "7 found, 2 close ones"],
  ["Demand", "growing"],
  ["Where buyers are", "Reddit, YouTube"],
  ["How it makes money", "subscription"],
]

/**
 * What else the product does once the first check is done. Three
 * plain rows, each a sentence and a picture, instead of a grid of
 * matching icon cards. The name ideas come from a real search when
 * there is one; the studio and watchlist are private to each account,
 * so their pictures are labelled as examples.
 */
export default function Suite({ latest }: { latest: Specimen | null }) {
  const shortlist =
    latest?.query && latest.shortlist && latest.shortlist.length > 1
      ? { query: latest.query, names: latest.shortlist }
      : null
  const ideas = shortlist ?? EXAMPLE_SHORTLIST

  return (
    <section id="suite" className="scroll-mt-20 border-b px-4 py-20 md:py-28">
      <div className="mx-auto max-w-7xl space-y-8">
        <SectionHeader
          align="start"
          eyebrow="More than a check"
          title="No name yet? Start from your idea."
          lede="Checking a name is free. When you need more, the same account helps you find a name, or even the idea, and keeps an eye on the names you like."
        />

        <GsapReveal stagger={0.08} className="divide-y border-y">
          <Feature
            title="Get name ideas that are already checked"
            body="Describe what you're building in a sentence. We suggest names from several angles, keep the strongest, and check every one of them before you see it."
            href="/auth"
            cta="Get name ideas"
          >
            <Picture
              label={
                shortlist
                  ? `A real search: “${ideas.query}”`
                  : `Example: “${ideas.query}”`
              }
            >
              <ul className="space-y-1.5">
                {ideas.names.map((item) => (
                  <li key={item.name} className="flex justify-between gap-3">
                    <span className="truncate">{item.name}</span>
                    <span className={cn("tabular-nums", scoreTone(item.score))}>
                      {item.score}/100
                    </span>
                  </li>
                ))}
              </ul>
            </Picture>
          </Feature>

          <Feature
            title="Find a business idea worth naming"
            body="Not sure what to build? Tell us what you're good at and who you want to help. We suggest ideas and research each one: who else does it, whether people want it, and how it could make money."
            href="/auth"
            cta="Find an idea"
          >
            <Picture label="Example research on one idea">
              <ul className="space-y-1.5">
                {RESEARCH.map(([label, value]) => (
                  <li key={label} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="truncate">{value}</span>
                  </li>
                ))}
              </ul>
            </Picture>
          </Feature>

          <Feature
            title="Hear about it if someone takes your name"
            body="Add the names you like to your watchlist. With Pro we check them again every few hours and email you the moment a website address or username gets taken."
            href="/pricing"
            cta="See Pro"
          >
            <Picture label="Example email">
              <p>
                <span className={TONE.taken}>lumivo.io</span> was taken
                overnight.
              </p>
              <p className="mt-1.5 text-muted-foreground">
                4 of your 6 saved names are still free.
              </p>
            </Picture>
          </Feature>
        </GsapReveal>
      </div>
    </section>
  )
}
