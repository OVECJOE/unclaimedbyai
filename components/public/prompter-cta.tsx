"use client"

import { useRouter } from "next/navigation"
import Prompter from "@/components/app/prompter"

export const PENDING_BRIEF_KEY = "uba-pending-brief"

export default function PrompterCta() {
  const router = useRouter()

  function onSubmit(value: string) {
    try {
      sessionStorage.setItem(PENDING_BRIEF_KEY, value)
    } catch {
      // Storage unavailable; the query param still carries the brief.
    }
    router.push(`/dashboard?brief=${encodeURIComponent(value)}`)
  }

  return <Prompter onSubmit={onSubmit} />
}
