import { Badge } from "@/components/ui/badge"
import Prompter from "@/components/prompter"
import { HugeiconsIcon } from "@hugeicons/react"
import { AtIcon, BrainIcon, InternetIcon } from "@hugeicons/core-free-icons"
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Metadata } from "next"
import { JsonLd } from "@/components/json-ld"
import { homeJsonLd, pageMetadata } from "@/lib/site"
import { WaitlistDialog } from "@/components/waitlist-dialog"

const AUDIENCE_EXAMPLE = ["Founders", "Creators", "Makers", "Marketers"]

export const metadata: Metadata = pageMetadata({
  title: "Discover names for your idea",
  description:
    "Generate names for your idea, then check domains, social handles, and AI associations across GPT, Claude, and Gemini before you build around one.",
  path: "/",
})

export default function Page() {
  return (
    <>
      <JsonLd data={homeJsonLd} />
      <WaitlistDialog />

      {/* Hero */}
      <section className="space-y-5 border-b px-4 py-10 sm:text-center">
        <Badge
          className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
          asChild
        >
          <p className="px-2 py-1 sm:px-3">
            Claim it before someone&apos;s chatbot already has
          </p>
        </Badge>
        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            Is your name actually{" "}
            <span className="text-primary">unclaimed?</span>
          </h1>
          <p className="mx-auto max-w-prose md:text-lg">
            Generate names for your idea. Then check domains, social handles,
            and AI associations before you build around one.
          </p>
        </div>
        <Prompter />
      </section>

      {/* Things to know */}
      <section className="border-b px-4 py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 sm:grid-cols-3">
          <article className="flex items-start gap-2">
            <Badge
              className="bg-primary/20 p-2 text-primary dark:bg-primary/30 dark:text-primary-foreground"
              asChild
            >
              <HugeiconsIcon icon={InternetIcon} className="size-10" />
            </Badge>
            <div className="space-y-1">
              <h3 className="font-heading text-xl font-semibold md:text-2xl">
                Domains
              </h3>
              <p className="text-sm text-muted-foreground">
                Check .com, .ai, .app and more
              </p>
            </div>
          </article>
          <article className="flex items-start gap-2">
            <Badge
              className="bg-primary/20 p-2 text-primary dark:bg-primary/30 dark:text-primary-foreground"
              asChild
            >
              <HugeiconsIcon icon={AtIcon} className="size-10" />
            </Badge>
            <div className="space-y-1">
              <h3 className="font-heading text-xl font-semibold md:text-2xl">
                Social handles
              </h3>
              <p className="text-sm text-muted-foreground">
                Check usernames across the platforms you need.
              </p>
            </div>
          </article>
          <article className="flex items-start gap-2">
            <Badge
              className="bg-primary/20 p-2 text-primary dark:bg-primary/30 dark:text-primary-foreground"
              asChild
            >
              <HugeiconsIcon icon={BrainIcon} className="size-10" />
            </Badge>
            <div className="space-y-1">
              <h3 className="font-heading text-xl font-semibold md:text-2xl">
                AI association
              </h3>
              <p className="text-sm text-muted-foreground">
                Ask top AI models what this name already means.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-10 sm:text-center">
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-semibold">
              How it works
            </h2>
            <p className="text-muted-foreground md:text-lg">
              Three simple steps to find a name you can actually own.
            </p>
          </div>
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-center sm:gap-3">
            <article className="flex-1 space-y-2 border border-primary/20 bg-sidebar/50 px-3 py-5 text-start sm:border-0">
              <h5 className="font-heading text-xs font-bold text-primary uppercase">
                Step 1
              </h5>
              <div className="space-y-1">
                <h4 className="font-heading text-xl font-medium">Generate</h4>
                <p className="text-sm text-muted-foreground">
                  Tell us what you&apos;re building and we&apos;ll generate
                  names that fit.
                </p>
              </div>
            </article>
            <article className="flex-1 space-y-2 border border-primary/20 bg-sidebar/60 px-3 py-5 text-start sm:border-0">
              <h5 className="font-heading text-xs font-bold text-primary uppercase">
                Step 2
              </h5>
              <div className="space-y-1">
                <h4 className="font-heading text-xl font-medium">Check</h4>
                <p className="text-sm text-muted-foreground">
                  We check domains, social handles, and AI associations in real
                  time.
                </p>
              </div>
            </article>
            <article className="flex-1 space-y-2 border border-primary/20 bg-sidebar/70 px-3 py-5 text-start sm:border-0">
              <h5 className="font-heading text-xs font-bold text-primary uppercase">
                Step 3
              </h5>
              <div className="space-y-1">
                <h4 className="font-heading text-xl font-medium">Claim it</h4>
                <p className="text-sm text-muted-foreground">
                  Choose a name with confidence and build without the risk.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Audience Stats CTA */}
      <section className="space-y-10 border-b px-4 py-10 sm:text-center">
        <div className="space-y-4">
          <p className="text-xl">
            Built for founders, creators, and makers launching in the age of AI.
          </p>
          <AvatarGroup className="flex sm:justify-center">
            {AUDIENCE_EXAMPLE.map((name) => (
              <Avatar size="lg" key={name}>
                <AvatarImage
                  src={`https://i.pravatar.cc/150?img=${name}`}
                  alt={name}
                />
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            <AvatarGroupCount>+308</AvatarGroupCount>
          </AvatarGroup>
        </div>
        <Button size="lg" className="py-8 text-xl">
          <Link href="/sign-up">Claim yours</Link>
        </Button>
      </section>
    </>
  )
}
