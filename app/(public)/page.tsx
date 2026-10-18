import { Badge } from "@/components/ui/badge"
import PrompterCta from "@/components/public/prompter-cta"
import PublicSearchesStrip from "@/components/public/public-searches-strip"
import PressureSection from "@/components/public/pressure-section"
import GenerationSection from "@/components/public/generation-section"
import ChecksReceipts from "@/components/public/checks-receipts"
import PricingBand from "@/components/public/pricing-band"
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
import { JsonLd } from "@/components/app/json-ld"
import { homeJsonLd, pageMetadata } from "@/lib/site"
import { getMeServer } from "@/lib/api-server"

const AUDIENCE_EXAMPLE = ["Founders", "Creators", "Makers", "Marketers"]

export const metadata: Metadata = pageMetadata({
  title: "Discover names for your idea",
  description:
    "Generate names for your idea, then check domains, social handles, and AI associations across GPT, Claude, and Perplexity before you build around one.",
  path: "/",
})

export default async function Page() {
  let communityCount = 308
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8007"
    const res = await fetch(`${base}/api/v1/stats`, {
      next: { revalidate: 3600 },
    })
    if (res.ok) {
      const stats = (await res.json()) as { users?: number }
      if (typeof stats.users === "number" && stats.users > 0) {
        communityCount = stats.users
      }
    }
  } catch {
    communityCount = 308
  }
  const user = await getMeServer().catch(() => null)
  return (
    <>
      <JsonLd data={homeJsonLd} />

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
        <PrompterCta signedIn={Boolean(user)} />
      </section>

      <PublicSearchesStrip />

      {/* The problem, in three public numbers */}
      <PressureSection />

      {/* Ideas, generated */}
      <GenerationSection />

      {/* The three checks, as receipts */}
      <ChecksReceipts />

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-b px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-10 sm:text-center">
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-semibold">
              How it works
            </h2>
            <p className="text-muted-foreground md:text-lg">
              Four steps from a blank page to a name you can actually own.
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
                  Describe what you&apos;re building. Four studios argue from
                  different angles, a judge keeps the strongest, and a sandbox
                  fills with name ideas.
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
                  Turn an idea into names, then check each one: the domain, the
                  social handles, and what ChatGPT and Claude already think the
                  name means.
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
                  Buy the domain at a registrar, in your own name. We tell you
                  it&apos;s open; the registration is yours.
                </p>
              </div>
            </article>
            <article className="flex-1 space-y-2 border border-primary/20 bg-sidebar/80 px-3 py-5 text-start sm:border-0">
              <h5 className="font-heading text-xs font-bold text-primary uppercase">
                Step 4
              </h5>
              <div className="space-y-1">
                <h4 className="font-heading text-xl font-medium">Watch it</h4>
                <p className="text-sm text-muted-foreground">
                  Star the name and Pro rechecks it every few hours, emailing
                  you the morning something gets claimed.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* What it costs */}
      <PricingBand />

      {/* Audience Stats CTA */}
      <section className="space-y-10 px-4 py-10 sm:text-center">
        <div className="space-y-4">
          <p className="text-xl">
            Built for founders, creators, and makers launching in the age of AI.
          </p>
          <AvatarGroup className="flex sm:justify-center">
            {AUDIENCE_EXAMPLE.map((audience, index) => (
              <Avatar size="lg" key={audience}>
                <AvatarImage
                  src={`https://i.pravatar.cc/150?img=${index + 11}`}
                  alt={audience}
                />
                <AvatarFallback>{audience.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            <AvatarGroupCount>+{communityCount}</AvatarGroupCount>
          </AvatarGroup>
        </div>
        <Button size="lg" className="py-8 text-xl">
          <Link href={user ? "/dashboard" : "/auth"}>Claim yours</Link>
        </Button>
      </section>
    </>
  )
}
