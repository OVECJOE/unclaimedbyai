import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { MailAtSign02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { TextDivider } from "@/components/app/text-divider"
import GoogleButton from "@/components/public/google-button"
import MagicLinkForm from "@/components/public/magic-link-form"
import { MagicLinkTimer } from "@/components/public/magic-link-timer"
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
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const packs = (await res.json()) as { slug: string; title: string }[]
    return packs.find((pack) => pack.slug === slug)?.title ?? null
  } catch {
    return null
  }
}

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>
}) {
  const { email, sentAt, plan } = await searchParams
  const picked = plan ? await planTitle(plan) : null

  if (email) {
    return (
      <section className="space-y-5 px-4 py-10 text-center md:mt-16">
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
              onResendAction={sendMagicLink}
            />
          </div>
          <Link
            href={plan ? `/auth?plan=${encodeURIComponent(plan)}` : "/auth"}
            className="text-primary"
          >
            Use a different email
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-5 px-4 py-10 sm:text-center md:mt-16">
      <div className="space-y-1">
        <h1 className="font-heading text-4xl font-bold sm:text-5xl">
          Continue to your dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in or create an account — it&apos;s the same either way.
        </p>
        {picked ? (
          <p className="text-sm font-medium text-primary">
            You picked the {picked} pack. Sign in and it will be waiting on the
            billing page.
          </p>
        ) : null}
      </div>

      <GoogleButton plan={plan} />

      <TextDivider className="mx-auto max-w-lg" />

      <MagicLinkForm plan={plan} />
    </section>
  )
}
