import PrompterCta from "@/components/public/prompter-cta"
import ExampleChips from "@/components/landing/example-chips"
import LetterField from "@/components/fields/letter-field"

/**
 * The landing hero: the promise and the box, over a field of letters
 * that hides real names and answers the cursor (see LetterField). The
 * box is the only thing to do here; the field makes you want to.
 */
export default function Hero({
  signedIn,
  names,
}: {
  signedIn: boolean
  /** Names to hide in the field, from recent real checks. */
  names: string[]
}) {
  return (
    <section className="relative isolate overflow-hidden border-b">
      <LetterField names={names} />

      <div className="mx-auto max-w-4xl px-4 pt-16 pb-20 sm:pt-24 md:pb-28">
        <div className="space-y-6 sm:text-center">
          <h1
            data-field-avoid
            className="font-heading text-5xl leading-[1.02] text-balance md:text-6xl lg:text-7xl"
          >
            {/* The slogan alone names no entity; the screen-reader
                prefix gives the heading the brand and category that
                crawlers and assistive tech both key on. */}
            <span className="sr-only">Unclaimed by AI, the name checker: </span>
            Before you fall for a name,{" "}
            <span className="text-primary">find out who already has it.</span>
          </h1>

          <p
            data-field-avoid
            className="max-w-2xl text-lg text-pretty text-muted-foreground sm:mx-auto"
          >
            Type a name and we check the website address, the social media
            usernames, and what ChatGPT, Claude and Perplexity already think it
            means. No name yet? Describe your idea and we&apos;ll suggest some,
            then check each one the same way.
          </p>
        </div>

        <div className="mt-10 space-y-5">
          <div data-field-avoid className="mx-auto max-w-prose">
            <PrompterCta signedIn={signedIn} />
          </div>
          <div data-field-avoid className="mx-auto w-fit max-w-2xl">
            <ExampleChips />
          </div>
        </div>
      </div>
    </section>
  )
}
