import Link from "next/link"
import { Button } from "@/components/ui/button"
import GsapReveal from "@/components/about/gsap-reveal"
import GenerationMock from "@/components/public/generation-mock"

/**
 * The half of the product the old homepage never mentioned: ideas are
 * generated, not just checked. Server-rendered; the mock is the only
 * client part.
 */
export default function GenerationSection() {
  return (
    <section className="border-b px-4 py-10 md:py-16">
      <GsapReveal className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className="space-y-4">
          <p className="text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
            Before the checks
          </p>
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl md:text-4xl">
            Four studios argue.{" "}
            <span className="text-primary">A judge keeps the strongest.</span>
          </h2>
          <p className="max-w-prose text-muted-foreground md:text-lg">
            Describe what you are building and a sandbox fills with name ideas.
            Four studios generate from different angles at once, and a judge
            drops the duplicates and the weak ones. You pick four to eight ideas
            per run, steer with a seed if you have one, and open any card to
            take it further.
          </p>
          <ul className="space-y-2">
            {[
              [
                "Sandbox",
                "each project gets its own room, with its own steer, so a weekend idea and a serious one never share answers",
              ],
              [
                "Market research",
                "three credits buys competitors, demand, channels and monetization for one idea",
              ],
              [
                "One drag to names",
                "pull any idea onto the drop zone and a search starts for it",
              ],
            ].map(([term, detail]) => (
              <li key={term} className="text-sm">
                <span className="font-semibold">{term}.</span>{" "}
                <span className="text-muted-foreground">{detail}</span>
              </li>
            ))}
          </ul>
          <Button variant="outline" asChild>
            <Link href="/product#faq">See how generation works</Link>
          </Button>
        </div>
        <GenerationMock />
      </GsapReveal>
    </section>
  )
}
