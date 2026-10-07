"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Prompter from "@/components/app/prompter"
import { ApiError, generateFilledSearch } from "@/lib/api"

export default function GenerateAndGo() {
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function onSubmit(brief: string) {
    setPending(true)
    try {
      const search = await generateFilledSearch({ query: brief })
      router.push(`/dashboard/history/${search.id}`)
    } catch (err) {
      setPending(false)
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Try again."
      )
    }
  }

  return (
    <div className="mx-auto max-w-prose space-y-3">
      <Prompter onSubmit={(value) => void onSubmit(value)} pending={pending} />
      {pending ? (
        <p className="text-center text-sm text-muted-foreground">
          Generating names and saving your search…
        </p>
      ) : null}
    </div>
  )
}
