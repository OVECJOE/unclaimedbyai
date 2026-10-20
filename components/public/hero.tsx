import PrompterCta from "@/components/public/prompter-cta"
import HeroLoom from "@/components/public/hero-loom"
import { Badge } from "@/components/ui/badge"
import { getLoomTicker } from "@/lib/landing/loom"

/**
 * The landing hero. Left column keeps the existing, SEO-proven copy
 * and the working prompter; right column is the Haunted Shortlist
 * loom — the theatre that shows what a check actually does. The loom
 * receives only real public searches; its scanning drama is seeded
 * demo copy and stays behind aria-hidden.
 */
export default async function Hero({ signedIn }: { signedIn: boolean }) {
  const ticker = await getLoomTicker()

  return (
    <section className="relative border-b">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:py-14">
        <div className="space-y-5 sm:text-center lg:text-start">
          <Badge
            className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
            asChild
          >
            <p className="px-2 py-1 sm:px-3">
              Claim it before someone&apos;s chatbot already has
            </p>
          </Badge>
          <div className="space-y-3">
            <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              Every name,{" "}
              <span className="text-primary">
                checked before you fall for it
              </span>
              .
            </h1>
            <p className="mx-auto max-w-prose text-muted-foreground md:text-lg lg:mx-0">
              Describe what you&apos;re building: four naming studios go to
              work, an editor keeps the strongest, and every survivor is
              screened against live .com registration, real handle lookups, and
              what the biggest AI models already associate with it, so your
              shortlist is scored by what you can actually register today, not
              by what sounds nice.
            </p>
            <p className="text-sm text-muted-foreground">
              Live .com lookups,
              <span className="px-1.5" />
              GitHub, X, Instagram, TikTok and YouTube,
              <span className="px-1.5" />
              and GPT, Claude and Perplexity collision checks
            </p>
          </div>
          <PrompterCta signedIn={signedIn} />
        </div>
        <HeroLoom ticker={ticker} />
      </div>
    </section>
  )
}
