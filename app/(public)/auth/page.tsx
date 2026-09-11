import { TextDivider } from "@/components/app/text-divider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleIcon, MailAtSign02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { sendMagicLink } from "./actions"
import { MagicLinkTimer } from "@/components/public/magic-link-timer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
}

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>
}) {
  const { email, sentAt } = await searchParams

  if (email) {
    return (
      <section className="space-y-5 px-4 py-10 text-center md:mt-16">
        <div className="space-y-3">
          <Badge variant="default" className="p-4 text-primary bg-primary/5" asChild>
            <HugeiconsIcon icon={MailAtSign02Icon} size="64px" />
          </Badge>
          <h1 className="font-heading text-4xl font-semibold sm:text-5xl">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            We sent a link to <br />
            <Link
              href={`mailto:${email}`}
              className="text-foreground underline"
            >
              {email}
            </Link>
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          The link expires in 15 minutes. Check spam if you don&apos;t see it.
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 justify-center">
            <span>Didn&apos;t get it?</span>
            <MagicLinkTimer
              sentAt={sentAt}
              email={email}
              onResendAction={sendMagicLink}
            />
          </div>
          <Link href="/auth" className="text-primary">
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
      </div>

      {/* Google OAuth */}
      <Button variant="outline" size="lg" asChild>
        <Link href="/auth/google">
          <HugeiconsIcon icon={GoogleIcon} size="48px" />
          <span className="font-semibold">Continue with Google</span>
        </Link>
      </Button>

      <TextDivider className="mx-auto max-w-lg" />

      {/* Magic Link */}
      <form
        className="mt-16 space-y-4 sm:mx-auto sm:max-w-lg"
        method="POST"
        action={sendMagicLink}
      >
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="font-medium text-muted-foreground uppercase"
          >
            Email
          </Label>
          <Input
            id="email"
            name="email"
            placeholder="you@example.com"
            autoComplete="off"
            autoFocus
          />
        </div>
        <Button size="lg" className="w-full" type="submit">
          <span className="font-semibold">Continue with email</span>
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-primary">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </section>
  )
}
