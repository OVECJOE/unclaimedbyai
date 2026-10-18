import GsapReveal from "@/components/about/gsap-reveal"
import CountUp from "@/components/about/count-up"
import {
  ChatGptPressureChart,
  DisputePressureChart,
  DomainPressureChart,
} from "@/components/public/pressure-charts"

const PRESSURE = [
  {
    label: "Domains registered",
    value: 401.6,
    decimals: 1,
    suffix: "M",
    caption: "names already parked across every TLD, growing every quarter",
    source: "Verisign Domain Name Industry Brief",
    Chart: DomainPressureChart,
  },
  {
    label: "Name disputes, 2025",
    value: 6282,
    decimals: 0,
    suffix: "",
    caption: "cybersquatting cases at WIPO, an all-time record",
    source: "WIPO Arbitration and Mediation Center",
    Chart: DisputePressureChart,
  },
  {
    label: "Weekly ChatGPT users",
    value: 900,
    decimals: 0,
    suffix: "M",
    caption: "people asking models what things mean, including your name",
    source: "OpenAI figures, reported widely",
    Chart: ChatGptPressureChart,
  },
] as const

/**
 * Why this product exists, in three public numbers. Server-rendered;
 * the charts are the only client parts, and the count-ups run once on
 * scroll with the final number already in the HTML.
 */
export default function PressureSection() {
  return (
    <section className="border-b px-4 py-10 md:py-16">
      <GsapReveal className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2 sm:text-center">
          <p className="text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
            Why this exists
          </p>
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl md:text-4xl">
            Naming something in 2026 means clearing{" "}
            <span className="text-primary">three land grabs</span> at once
          </h2>
          <p className="mx-auto max-w-prose text-muted-foreground md:text-lg">
            A domain someone squatted. A trademark someone holds. And a name an
            AI model already answers for. Each one alone is a footnote. Together
            they are why a good name is harder to keep than ever.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
          {PRESSURE.map(
            ({ label, value, decimals, suffix, caption, source, Chart }) => (
              <article
                key={label}
                data-reveal
                className="flex flex-col gap-3 bg-background p-5 sm:py-8"
              >
                <p className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
                  {label}
                </p>
                <p className="font-heading text-5xl leading-none text-primary sm:text-6xl">
                  <CountUp value={value} decimals={decimals} suffix={suffix} />
                </p>
                <p className="text-sm text-muted-foreground">{caption}</p>
                <Chart />
                <p className="font-mono text-[0.625rem] text-muted-foreground">
                  Source: {source}
                </p>
              </article>
            )
          )}
        </div>
      </GsapReveal>
    </section>
  )
}
