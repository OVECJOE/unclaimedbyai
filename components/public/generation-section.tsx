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
            Describe it once.{" "}
            <span className="text-primary">Get names worth arguing about.</span>
          </h2>
          <p className="max-w-prose text-muted-foreground md:text-lg">
            Tell us what you&apos;re building, and four naming studios take a
            shot at it from different angles. An editor throws out the weak ones
            and the duplicates, and every survivor is checked against live .com
            registration and social handles before it reaches you. What lands is
            a scored shortlist you can actually register, not a pile of maybes.
          </p>
          <ul className="space-y-2">
            {[
              [
                "Sandbox",
                "each project gets its own room, so a weekend idea and a serious one never share answers",
              ],
              [
                "Market research",
                "spend 3 credits to learn who else plays in the space, whether people are searching, and how the idea would make money",
              ],
              [
                "One drag to names",
                "pull any idea onto the strip below the board and we start finding names for it",
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
