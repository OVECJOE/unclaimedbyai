import AppHeader from "@/components/app-header"
import { Badge } from "@/components/ui/badge"
import Prompter from "@/components/prompter"
import { HugeiconsIcon } from "@hugeicons/react"
import { AtIcon, BrainIcon, InternetIcon } from "@hugeicons/core-free-icons"

export default function Page() {
  return (
    <div>
      <AppHeader />

      <main>
        {/* Hero section */}
        <section className="space-y-5 sm:text-center border-b py-10 px-4">
          <Badge className="bg-primary/10 text-primary" asChild>
            <p className="py-1 px-3">Claim it before someone&apos;s chatbot already has</p>
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

        {/* Feature categories section */}
        <section className="space-y-5 border-b py-10 px-4">
          <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-3 gap-3">
            <article className="flex items-start gap-2">
              <Badge className="bg-primary/20 text-primary p-2" asChild>
                <HugeiconsIcon icon={InternetIcon} className="size-10" />
              </Badge>
              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-semibold font-heading">Domains</h3>
                <p className="text-sm text-muted-foreground">Check .com, .ai, .app and more</p>
              </div>
            </article>
            <article className="flex items-start gap-2">
              <Badge className="bg-primary/20 text-primary p-2" asChild>
                <HugeiconsIcon icon={AtIcon} className="size-10" />
              </Badge>
              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-semibold font-heading">Social handles</h3>
                <p className="text-sm text-muted-foreground">Check usernames across the platforms you need.</p>
              </div>
            </article>
            <article className="flex items-start gap-2">
              <Badge className="bg-primary/20 text-primary p-2" asChild>
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
      </main>
    </div>
  )
}
