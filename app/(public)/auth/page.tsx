import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { MailAtSign02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { TextDivider } from "@/components/app/text-divider"
import GoogleButton from "@/components/public/google-button"
import MagicLinkForm from "@/components/public/magic-link-form"
import { MagicLinkTimer } from "@/components/public/magic-link-timer"
import PlaySound from "@/components/sound/play-sound"
import TrackOnce from "@/components/app/track"
import LetterField from "@/components/fields/letter-field"
import { sendMagicLink } from "./actions"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
}

async function planTitle(slug: string): Promise<string | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8007"
    const res = await fetch(`${base}/api/v1/packs`, {
      cache: "no-store",
    })
    if (!res.ok) return null
    const packs = (await res.json()) as { slug: string; title: string }[]
    return packs.find((pack) => pack.slug === slug)?.title ?? null
  } catch {
    return null
  }
}

const PERKS = [
  {
    index: "01",
    title: "Your history, saved",
    body: "Every check and shortlist you run, newest first, ready to re-check.",
  },
  {
    index: "02",
    title: "Generation and the studio",
    body: "Four naming studios for your brief, and a sandbox of researched ideas.",
  },
  {
    index: "03",
    title: "A watchlist for the names you love",
    body: "Pro rechecks them every few hours and emails you when something changes.",
  },
]

const AUTH_ERRORS: Record<string, string> = {
  link: "That sign-in link expired or was already used. Send a new one below.",
  "oauth-config":
    "Google sign-in isn't set up on this deployment yet. Use email instead.",
  "oauth-state": "That sign-in attempt expired. Please try Google again.",
  "oauth-exchange":
    "Google sign-in didn't complete. Please try again, or use email instead.",
  "oauth-email":
    "That Google account's email address isn't verified. Verify it with Google, or use email instead.",
  oauth:
    "Google sign-in didn't complete. Please try again, or use email instead.",
}

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>
}) {
  const { email, sentAt, plan, error, next: nextPath } = await searchParams
  const picked = plan ? await planTitle(plan) : null
  const errorMessage = error ? (AUTH_ERRORS[error] ?? AUTH_ERRORS.oauth) : null

  if (email) {
    return (
      <section className="space-y-5 px-4 py-10 text-center md:mt-16">
        <PlaySound mood="reveal" seed={`magic-link:${email}`} />
        <TrackOnce name="magic_link_sent" />
        <div className="space-y-3">
          <Badge
            variant="default"
            className="bg-primary/5 p-4 text-primary"
            asChild
          >
            <HugeiconsIcon icon={MailAtSign02Icon} size="64px" />
          </Badge>
          <h1 className="font-heading text-4xl font-semibold sm:text-5xl">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We sent a sign-in link to <br />
            <Link
              href={`mailto:${email}`}
              className="text-foreground underline"
            >
              {email}
            </Link>
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          The link works for the next 15 minutes. Check spam if you don&apos;t
          see it.
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <span>Didn&apos;t get it?</span>
            <MagicLinkTimer
              sentAt={sentAt}
              email={email}
              plan={plan}
              next={nextPath}
              onResendAction={sendMagicLink}
            />
          </div>
          <Link
            href={
              plan || nextPath
                ? `/auth?${new URLSearchParams({ ...(plan ? { plan } : {}), ...(nextPath ? { next: nextPath } : {}) }).toString()}`
                : "/auth"
            }
            className="text-primary"
          >
            Use a different email
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="relative isolate overflow-hidden px-4 py-14 md:py-24">
      <LetterField quiet fade="both" />
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
        <div className="space-y-8">
          <div className="space-y-4">
            <p
              data-field-avoid
              className="w-fit font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-primary uppercase"
            >
              Sign in or sign up
            </p>
            <h1
              data-field-avoid
              className="font-heading text-5xl leading-[1.02] tracking-tight text-balance md:text-6xl">
              Your names are{" "}
              <span className="text-primary">waiting.</span>
            </h1>
            <p
              data-field-avoid
              className="max-w-md text-lg text-muted-foreground"
            >
              One account for everything. Signing in and creating an account
              are the same step.
            </p>
          </div>
          <ul data-field-avoid className="hidden divide-y border-y lg:block">
            {PERKS.map((perk) => (
              <li key={perk.title} className="flex gap-4 py-4">
                <span className="font-mono text-xs text-primary">
                  {perk.index}
                </span>
                <div>
                  <p className="font-medium">{perk.title}</p>
                  <p className="text-sm text-muted-foreground">{perk.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div
          data-field-avoid
          className="space-y-5 border bg-background p-6 sm:p-8"
        >
          <p className="font-heading text-3xl">Continue to your dashboard</p>
          {picked ? (
            <p className="border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
              You picked the {picked} pack. Sign in and it will be waiting on
              the billing page.
            </p>
          ) : null}

          {errorMessage ? (
            <p
              role="alert"
              className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {errorMessage}
            </p>
          ) : null}

          <div className="[&>a]:h-12 [&>a]:w-full">
            <GoogleButton plan={plan} next={nextPath} />
          </div>

          <TextDivider />

          <MagicLinkForm plan={plan} next={nextPath} />
        </div>
      </div>
    </section>
  )
}
