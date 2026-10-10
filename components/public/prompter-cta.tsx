"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Prompter from "@/components/app/prompter"
import { useTurnstile } from "@/components/public/turnstile"
import { getAnonSessionId } from "@/lib/anon"
import { ApiError, generateFilledSearch, getMe } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"

export const PENDING_BRIEF_KEY = "uba-pending-brief"

export default function PrompterCta({
  defaultValue = "",
}: {
  defaultValue?: string
}) {
  const [pending, setPending] = useState(false)
  const router = useRouter()
  const turnstile = useTurnstile("anonymous_generate")

  async function onSubmit(value: string) {
    setPending(true)
    try {
      const user = await getMe(5000).catch(() => null)
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
        cf_turnstile_token: turnstile.getToken() ?? undefined,
      })
      router.push(
        `/results/${search.id}?sid=${encodeURIComponent(getAnonSessionId())}`
      )
    } catch (error) {
      setPending(false)
      turnstile.reset()
      if (error instanceof ApiError && error.status === 403) {
        toast.error(
          "The human check didn't pass. Give it another go in a moment."
        )
        return
      }
      toastApiError(error, "Something went wrong. Try again.")
    }
  }

  return (
    <div className="space-y-3">
      <Prompter
        onSubmit={(brief) => void onSubmit(brief)}
        pending={pending}
        defaultValue={defaultValue}
      />
      {pending ? (
        <p role="status" className="text-center text-sm text-muted-foreground">
          Starting your search… you&apos;ll see names arrive live.
        </p>
      ) : null}
      {turnstile.widget}
    </div>
  )
}
