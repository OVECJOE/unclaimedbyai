import PrompterCta from "@/components/public/prompter-cta"
import HeroLoom from "@/components/public/hero-loom"
import { Badge } from "@/components/ui/badge"

/**
 * The landing hero. Left column keeps the existing, SEO-proven copy;
 * the prompter and the loom are separate grid cells so that on mobile
 * the loom rises above the prompter while on desktop it sits to the
 * right, spanning both rows. The loom is self-contained demo theatre,
 * so it renders instantly with no fetch.
 */
export default function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative border-b">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-x-14 lg:gap-y-6 lg:py-14">
        {/* The words. */}
        <div className="space-y-5 sm:text-center lg:col-start-1 lg:row-start-1 lg:text-start">
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
              {/* The slogan alone names no entity; the screen-reader
                  prefix gives the heading the brand and category that
                  crawlers and assistive tech both key on. */}
              <span className="sr-only">
                Unclaimed by AI, the name checker:{" "}
              </span>
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
              <span className="px-1" />
              GitHub, X, Instagram, TikTok and YouTube,
              <span className="px-1" />
              and GPT, Claude and Perplexity collision checks
            </p>
          </div>
        </div>

        {/* The loom: self-contained demo theatre, before the prompter on
            mobile, beside it on desktop. */}
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <HeroLoom />
        </div>

        {/* The prompter. */}
        <div className="lg:col-start-1 lg:row-start-2">
          <PrompterCta signedIn={signedIn} />
        </div>
      </div>
    </section>
  )
}
