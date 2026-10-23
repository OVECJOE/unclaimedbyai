"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { armClaimOnSignIn } from "@/lib/anon"

/**
 * The sign-in button on the anonymous results page. It is the only
 * surface that arms the claim-on-signin intent, so an anonymous
 * search joins the account exactly when its owner clicked here to
 * keep it — never as a side effect of signing in somewhere else.
 */
export default function SignInToClaim({
  href,
  variant,
  children,
}: {
  href: string
  variant?: "default" | "outline"
  children: React.ReactNode
}) {
  return (
    <Button variant={variant} asChild>
      <Link
        href={href}
        onClick={() => {
          armClaimOnSignIn()
        }}
      >
        {children}
      </Link>
    </Button>
  )
}
