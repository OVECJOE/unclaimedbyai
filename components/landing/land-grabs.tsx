import CountUp from "@/components/about/count-up"
import GsapReveal from "@/components/about/gsap-reveal"
import { SectionHeader } from "@/components/public/section-header"
import Link from "next/link"
import RegistryField from "@/components/fields/registry-field"

const GRABS = [
  {
    index: "I",
    title: "The address",
    value: 401.6,
    decimals: 1,
    suffix: "M",
    caption: "domains already registered, and the count rises every quarter.",
    source: "Verisign DNIB",
  },
  {
    index: "II",
    title: "The fight",
    value: 6282,
    decimals: 0,
    suffix: "",
    caption: "name disputes filed at WIPO in 2025, the most ever recorded.",
    source: "WIPO",
  },
  {
    index: "III",
    title: "The memory",
    value: 900,
    decimals: 0,
    suffix: "M",
    caption:
      "people ask ChatGPT something every week, and it answers with whatever it already believes about your name.",
    source: "OpenAI, widely reported",
  },
] as const

/**
 * Why the product exists, as three land grabs stacked like a ledger.
 * The final numbers are in the server HTML; CountUp only animates them.
 * Behind it, a grid of names filling up as they get registered.
 */
export default function LandGrabs() {
  return (
    <section className="relative isolate overflow-hidden border-b px-4 py-20 md:py-28">
      <RegistryField />
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <GsapReveal className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <SectionHeader
            align="start"
            eyebrow="Why this exists"
            title="You picked a good name."
            accent="So did three other people."
            lede="Naming used to mean one search. Now a name has to clear three separate land grabs, and the third one, inside the models people ask first, doesn't show up in any domain search."
          />
          <Link
            href="/about"
            data-field-avoid
            className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4"
          >
            The full story, with charts
          </Link>
        </GsapReveal>

        <GsapReveal stagger={0.12} className="divide-y border-y">
          {GRABS.map((grab) => (
            <article
              key={grab.index}
              data-reveal
              data-field-avoid
              className="grid grid-cols-[3rem_1fr] gap-x-4 gap-y-2 py-8 sm:grid-cols-[4rem_1fr_auto] sm:items-end"
            >
              <p className="font-heading text-2xl text-muted-foreground italic">
                {grab.index}
              </p>
              <div className="space-y-2">
                <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-primary uppercase">
                  {grab.title}
                </p>
                <p className="max-w-sm text-muted-foreground">{grab.caption}</p>
                <p className="font-mono text-[0.625rem] text-muted-foreground/80">
                  Source: {grab.source}
                </p>
              </div>
              <p className="col-start-2 font-heading text-6xl leading-none tabular-nums sm:col-start-3 sm:row-start-1 sm:text-7xl md:text-8xl">
                <CountUp
                  value={grab.value}
                  decimals={grab.decimals}
                  suffix={grab.suffix}
                />
              </p>
            </article>
          ))}
        </GsapReveal>
      </div>
    </section>
  )
}
