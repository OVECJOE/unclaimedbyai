"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GoogleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { writePlanCookie } from "@/components/public/plan-cookie"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8007"

export default function GoogleButton({ plan }: { plan?: string }) {
  return (
    <Button variant="outline" size="lg" asChild>
      <Link
        href={`${API_BASE}/api/v1/auth/google`}
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
