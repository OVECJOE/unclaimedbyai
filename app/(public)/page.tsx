import Hero from "@/components/public/hero"
import StatementScatter from "@/components/public/statement-scatter"
import BlogCarousel from "@/components/public/blog-carousel"
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
import { dicebearAvatar } from "@/lib/avatar"
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
    "Four naming studios generate names from your brief, an editor keeps the strongest, and every survivor is screened against live .com registration, social handles, and AI associations before it reaches you.",
  path: "/",
})

export default async function Page() {
  // The real number when stats answer, nothing when they don't: a
  // stale constant worse than no counter at all.
  let communityCount: number | null = null
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
    communityCount = null
  }
  const user = await getMeServer().catch(() => null)
  return (
    <>
      <JsonLd data={homeJsonLd} />

      {/* Hero: copy and prompter on the left, the Haunted Shortlist on the right */}
      <Hero signedIn={Boolean(user)} />

      <PublicSearchesStrip />

      {/* The problem, in three public numbers */}
      <PressureSection />

      {/* Ideas, generated */}
      <GenerationSection />

      {/* The story, in photographs: names get haunted */}
      <StatementScatter />

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
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <article className="space-y-2 border border-primary/20 bg-sidebar/50 px-3 py-5 text-start">
              <p className="font-heading text-xs font-bold text-primary uppercase">
                Step 1
              </p>
              <div className="space-y-1">
                <h3 className="font-heading text-xl font-medium">Generate</h3>
                <p className="text-sm text-muted-foreground">
                  Describe what you&apos;re building. Four naming studios argue
                  from different angles, an editor keeps the strongest, and your
                  report fills with scored candidates.
                </p>
              </div>
            </article>
            <article className="space-y-2 border border-primary/20 bg-sidebar/60 px-3 py-5 text-start">
              <p className="font-heading text-xs font-bold text-primary uppercase">
                Step 2
              </p>
              <div className="space-y-1">
                <h3 className="font-heading text-xl font-medium">Check</h3>
                <p className="text-sm text-muted-foreground">
                  Every candidate arrives checked: live .com registration, the
                  major social handles, and what ChatGPT and Claude already
                  think the name means. Re-check any name with one click.
                </p>
              </div>
            </article>
            <article className="space-y-2 border border-primary/20 bg-sidebar/70 px-3 py-5 text-start">
              <p className="font-heading text-xs font-bold text-primary uppercase">
                Step 3
              </p>
              <div className="space-y-1">
                <h3 className="font-heading text-xl font-medium">Claim it</h3>
                <p className="text-sm text-muted-foreground">
                  Buy the domain at a registrar, in your own name. We tell you
                  it&apos;s open; the registration is yours.
                </p>
              </div>
            </article>
            <article className="space-y-2 border border-primary/20 bg-sidebar/80 px-3 py-5 text-start">
              <p className="font-heading text-xs font-bold text-primary uppercase">
                Step 4
              </p>
              <div className="space-y-1">
                <h3 className="font-heading text-xl font-medium">Watch it</h3>
                <p className="text-sm text-muted-foreground">
                  Star the name and Pro rechecks it every few hours, emailing
                  you the morning something gets claimed.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Most-boosted writing */}
      <BlogCarousel />

      {/* What it costs */}
      <PricingBand />

      {/* Audience Stats CTA */}
      <section className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:text-center">
        <div className="space-y-4">
          <p className="text-xl">
            Built for founders, creators, and makers launching in the age of AI.
          </p>
          <AvatarGroup className="flex sm:justify-center">
            {AUDIENCE_EXAMPLE.map((audience) => (
              <Avatar size="lg" key={audience}>
                <AvatarImage src={dicebearAvatar(audience)} alt="" />
                <AvatarFallback>{audience.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {communityCount !== null ? (
              <AvatarGroupCount>+{communityCount}</AvatarGroupCount>
            ) : null}
          </AvatarGroup>
        </div>
        <Button size="lg" className="h-auto px-8 py-5 text-lg" asChild>
          <Link href={user ? "/dashboard" : "/auth"}>
            Claim your first shortlist
          </Link>
        </Button>
      </section>
    </>
  )
}
