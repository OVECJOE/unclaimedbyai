import AppHeader from "@/components/app-header"
import { Badge } from "@/components/ui/badge"
import Prompter from "@/components/prompter"
import { HugeiconsIcon } from "@hugeicons/react"
import { AtIcon, BrainIcon, InternetIcon } from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import AppFooter from "@/components/app-footer"

const AUDIENCE_EXAMPLE = [
  "Founders",
  "Creators",
  "Makers",
  "Marketers",
]

export default function Page() {
  return (
    <div>
      <AppHeader />

      <main>
        {/* Hero */}
        <section className="space-y-5 sm:text-center border-b py-10 px-4">
          <Badge className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground" asChild>
            <p className="py-1 px-2 sm:px-3">Claim it before someone&apos;s chatbot already has</p>
          </Badge>
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-semibold font-heading">
              Is your name actually{" "}
              <span className="text-primary">unclaimed</span>?
            </h1>
            <p className="md:text-lg max-w-prose mx-auto">
              Generate names for your idea. Then check domains, social handles, and AI
              associations before you build around one.
            </p>
          </div>
          <Prompter />
        </section>

        {/* Things to know */}
        <section className="border-b py-10 px-4">
          <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-3 gap-3">
            <article className="flex items-start gap-2">
              <Badge className="bg-primary/20 text-primary p-2 dark:bg-primary/30 dark:text-primary-foreground" asChild>
                <HugeiconsIcon icon={InternetIcon} className="size-10" />
              </Badge>
              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-semibold font-heading">Domains</h3>
                <p className="text-sm text-muted-foreground">Check .com, .ai, .app and more</p>
              </div>
            </article>
            <article className="flex items-start gap-2">
              <Badge className="bg-primary/20 text-primary p-2 dark:bg-primary/30 dark:text-primary-foreground" asChild>
                <HugeiconsIcon icon={AtIcon} className="size-10" />
              </Badge>
              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-semibold font-heading">Social handles</h3>
                <p className="text-sm text-muted-foreground">Check usernames across the platforms you need.</p>
              </div>
            </article>
            <article className="flex items-start gap-2">
              <Badge className="bg-primary/20 text-primary p-2 dark:bg-primary/30 dark:text-primary-foreground" asChild>
                <HugeiconsIcon icon={BrainIcon} className="size-10" />
              </Badge>
              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-semibold font-heading">AI association</h3>
                <p className="text-sm text-muted-foreground">
                  Ask top AI models what this name already means.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b py-10 px-4">
          <div className="mx-auto max-w-7xl sm:text-center space-y-10">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold font-heading">How it works</h2>
              <p className="md:text-lg text-muted-foreground">
                Three simple steps to find a name you can actually own.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-center gap-8 sm:gap-3">
              <article className="bg-sidebar/50 text-start space-y-2 flex-1 border sm:border-0 border-primary/20 py-5 px-3 sm:p-2">
                <h5 className="text-xs uppercase font-bold font-heading text-primary">Step 1</h5>
                <div className="space-y-1">
                  <h4 className="text-xl font-medium font-heading">Generate</h4>
                  <p className="text-sm text-muted-foreground">
                    Tell us what you&apos;re building and we&apos;ll generate names that fit.
                  </p>
                </div>
              </article>
              <article className="bg-sidebar/60 text-start space-y-2 flex-1 border sm:border-0 border-primary/20 py-5 px-3">
                <h5 className="text-xs uppercase font-bold font-heading text-primary">Step 2</h5>
                <div className="space-y-1">
                  <h4 className="text-xl font-medium font-heading">Check</h4>
                  <p className="text-sm text-muted-foreground">
                    We check domains, social handles, and AI associations in real time.
                  </p>
                </div>
              </article>
              <article className="bg-sidebar/70 text-start space-y-2 flex-1 border sm:border-0 border-primary/20 py-5 px-3">
                <h5 className="text-xs uppercase font-bold font-heading text-primary">Step 3</h5>
                <div className="space-y-1">
                  <h4 className="text-xl font-medium font-heading">Claim it</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose a name with confidence and build without the risk.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Audience Stats CTA */}
        <section className="space-y-10 sm:text-center border-b py-10 px-4">
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
          <Button size="lg" className="text-xl py-8">
            <Link href="/sign-up">Claim yours</Link>
          </Button>
        </section>

        <AppFooter />
      </main>
    </div>
  )
}
