"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function RateLimited() {
  const router = useRouter()

  return (
    <div className="space-y-3 border border-dashed p-6 text-center">
      <p className="font-heading text-xl">Too many requests</p>
      <p className="mx-auto max-w-prose text-sm text-muted-foreground">
        Slow down a little, then try again — nothing was lost.
      </p>
      <Button variant="outline" onClick={() => router.refresh()}>
        Try again
      </Button>
    </div>
  )
}
