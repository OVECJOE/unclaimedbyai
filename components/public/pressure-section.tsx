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
    caption: "web addresses already taken, and the count grows every quarter",
    source: "Verisign Domain Name Industry Brief",
    Chart: DomainPressureChart,
  },
  {
    label: "Name disputes, 2025",
    value: 6282,
    decimals: 0,
    suffix: "",
    caption:
      "fights over names at the UN's arbitration court, an all-time record",
    source: "WIPO Arbitration and Mediation Center",
    Chart: DisputePressureChart,
  },
  {
    label: "Weekly ChatGPT users",
    value: 900,
    decimals: 0,
    suffix: "M",
    caption:
      "people asking chatbots questions every week, including about your product category",
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
            You picked a good name.{" "}
            <span className="text-primary">So did three other people.</span>
          </h2>
          <p className="mx-auto max-w-prose text-muted-foreground md:text-lg">
            The domain is taken. Someone else trademarked something close. And
            when people ask ChatGPT about your kind of product, it already has
            an answer, and that answer is about someone else. Any one of those
            is annoying. All three at once is why naming something today feels
            impossible.
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
