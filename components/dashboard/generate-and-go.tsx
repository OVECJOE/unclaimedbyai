"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Prompter from "@/components/app/prompter"
import { PENDING_BRIEF_KEY } from "@/components/public/prompter-cta"
import { generateFilledSearch } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"

export default function GenerateAndGo({
  initialBrief = "",
}: {
  initialBrief?: string
}) {
  const [pending, setPending] = useState(false)
  const submittedRef = useRef(false)
  const router = useRouter()

  async function onSubmit(brief: string) {
    setPending(true)
    try {
      const search = await generateFilledSearch({ query: brief })
      router.push(`/dashboard/history/${search.id}`)
    } catch (err) {
      setPending(false)
      toastApiError(err, "Something went wrong. Try again.")
    }
  }

  useEffect(() => {
    if (submittedRef.current || pending) return
    let brief = initialBrief
    if (!brief) {
      try {
        brief = sessionStorage.getItem(PENDING_BRIEF_KEY) ?? ""
        sessionStorage.removeItem(PENDING_BRIEF_KEY)
      } catch {
        brief = ""
      }
    }
    if (brief.trim()) {
      submittedRef.current = true
      void onSubmit(brief.trim())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBrief])

  return (
    <div className="mx-auto max-w-prose space-y-3">
      <Prompter
        onSubmit={(value) => void onSubmit(value)}
        pending={pending}
        defaultValue={initialBrief}
      />
      {pending ? (
        <p className="text-center text-sm text-muted-foreground">
          Starting your search… results open right away and fill in live.
        </p>
      ) : null}
    </div>
  )
}
