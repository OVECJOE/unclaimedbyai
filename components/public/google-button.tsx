"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GoogleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { writePlanCookie } from "@/components/public/plan-cookie"

export default function GoogleButton({ plan }: { plan?: string }) {
  return (
    <Button variant="outline" size="lg" asChild>
      <Link
        href="/api/v1/auth/google"
        onClick={() => {
          if (plan) writePlanCookie(plan)
        }}
      >
        <HugeiconsIcon icon={GoogleIcon} size="48px" />
        <span className="font-semibold">Continue with Google</span>
      </Link>
    </Button>
  )
}
