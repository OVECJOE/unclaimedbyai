"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Prompter from "@/components/app/prompter"
import { getAnonSessionId } from "@/lib/anon"
import { generateFilledSearch, getMe } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"

export const PENDING_BRIEF_KEY = "uba-pending-brief"

export default function PrompterCta({
  defaultValue = "",
}: {
  defaultValue?: string
}) {
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function onSubmit(value: string) {
    setPending(true)
    try {
      const user = await getMe().catch(() => null)
      if (user) {
        try {
          sessionStorage.setItem(PENDING_BRIEF_KEY, value)
        } catch {
          // Storage unavailable; the query param still carries the brief.
        }
        router.push(`/dashboard?brief=${encodeURIComponent(value)}`)
        return
      }
      const search = await generateFilledSearch({
        query: value,
        anon_session_id: getAnonSessionId(),
      })
      router.push(
        `/results/${search.id}?sid=${encodeURIComponent(getAnonSessionId())}`
      )
    } catch (error) {
      setPending(false)
      toastApiError(error, "Something went wrong. Try again.")
    }
  }

  return (
    <Prompter
      onSubmit={(brief) => void onSubmit(brief)}
      pending={pending}
      defaultValue={defaultValue}
    />
  )
}
