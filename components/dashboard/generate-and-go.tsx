"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Prompter, { type PrompterMode } from "@/components/app/prompter"
import ShortageDialog from "@/components/dashboard/shortage-dialog"
import { PENDING_BRIEF_KEY } from "@/components/public/prompter-cta"
import { ApiError, directCheck, generateFilledSearch } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"

export default function GenerateAndGo({
  initialBrief = "",
}: {
  initialBrief?: string
}) {
  const [pending, setPending] = useState(false)
  const [shortage, setShortage] = useState(false)
  const submittedRef = useRef(false)
  const router = useRouter()

  async function onSubmit(brief: string, mode: PrompterMode) {
    setPending(true)
    try {
      if (mode === "name") {
        const result = await directCheck({ name: brief })
        router.push(`/dashboard/history/${result.search_id}`)
        return
      }
      const search = await generateFilledSearch({ query: brief })
      router.push(`/dashboard/history/${search.id}`)
    } catch (err) {
      setPending(false)
      if (err instanceof ApiError && err.status === 402) {
        setShortage(true)
        return
      }
      toastApiError(err, "Something went wrong. Try again.")
    }
  }

  useEffect(() => {
    if (submittedRef.current || pending) return
    // The stored brief is single-use: clear it no matter which source we
    // end up reading, so a later visit can't auto-start a phantom search.
    let stored = ""
    try {
      stored = sessionStorage.getItem(PENDING_BRIEF_KEY) ?? ""
      if (stored) sessionStorage.removeItem(PENDING_BRIEF_KEY)
    } catch {
      stored = ""
    }
    const brief = (initialBrief || stored).trim()
    if (brief) {
      submittedRef.current = true
      const id = setTimeout(() => void onSubmit(brief, "idea"), 0)
      return () => clearTimeout(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBrief])

  return (
    <div className="mx-auto max-w-prose space-y-3">
      <Prompter
        onSubmit={(value, mode) => void onSubmit(value, mode)}
        pending={pending}
        defaultValue={initialBrief}
      />
      {pending ? (
        <p className="text-center text-sm text-muted-foreground">
          Starting your search… results open right away and fill in live.
        </p>
      ) : null}
      <ShortageDialog
        open={shortage}
        kind="searches"
        onOpenChange={(next) => {
          if (!next) setShortage(false)
        }}
      />
    </div>
  )
}
