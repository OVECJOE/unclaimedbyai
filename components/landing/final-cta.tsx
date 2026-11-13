import Link from "next/link"
import FocusPrompterButton from "@/components/landing/focus-prompter-button"
import { Button } from "@/components/ui/button"
import LetterField from "@/components/fields/letter-field"

/**
 * The closing argument: a full-bleed band with the brand line set huge,
 * and two ways in. It points back at the hero prompter rather than
 * mounting a second one. Behind it, names get taken one by one while
 * you read; click near a free one to claim it first.
 */
export default function FinalCta({
  signedIn,
  names = [],
}: {
  signedIn: boolean
  names?: string[]
}) {
  return (
    <section className="relative isolate overflow-hidden px-4 py-24 md:py-32">
      <LetterField names={names} mode="claim" fade="both" />
      <div className="mx-auto max-w-4xl space-y-8 sm:text-center">
        <h2
          data-field-avoid
          className="font-heading text-5xl leading-[0.98] tracking-tight text-balance md:text-6xl">
          Claim it before someone&apos;s{" "}
          <span className="text-primary">chatbot already has.</span>
        </h2>
        <p
          data-field-avoid
          className="max-w-xl text-lg text-muted-foreground sm:mx-auto">
          The first check on every name is free. It takes less than a minute,
          and you don&apos;t need an account.
        </p>
        <div
          data-field-avoid
          className="mx-auto flex w-full flex-col gap-3 sm:w-fit sm:flex-row"
        >
          <FocusPrompterButton className="h-12 px-10">
            Check a name now
          </FocusPrompterButton>
          <Button asChild variant="outline" size="lg" className="h-12 px-10">
            <Link href={signedIn ? "/dashboard" : "/auth"}>
              {signedIn ? "Open your dashboard" : "Create a free account"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
