"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Prompter, { type PrompterMode } from "@/components/app/prompter"
import { createSandbox, directCheck, generateIdeas } from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"

/**
 * The prompter inside the dashboard. Ideas and studios build a sandbox
 * and land the canvas on it. A name leaves the dashboard, so it asks
 * first rather than yanking the person out of work in progress. Studio
 * mode shows an onboarding nudge when the account steer is still empty,
 * because a new signup's ideas are only as good as the answers it gets.
 */
export default function DashboardPrompter({
  hasSignals,
}: {
  hasSignals: boolean
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [confirmName, setConfirmName] = useState<string | null>(null)

  async function runIdea(value: string) {
    const sandbox = await createSandbox({ name: value.slice(0, 80) })
    await generateIdeas(sandbox.public_id, {
      count: 6,
      seed: value.slice(0, 300),
    })
    router.push(`/dashboard/playground?sandbox=${sandbox.public_id}`)
  }

  async function onSubmit(value: string, mode: PrompterMode) {
    setPending(true)
    try {
      if (mode === "name") {
        const result = await directCheck({ name: value })
        router.push(`/dashboard/history/${result.search_id}`)
        return
      }
      await runIdea(value)
    } catch (error) {
      setPending(false)
      toastApiError(error, "Something went wrong. Try again.")
    }
  }

  function submitNameOutside(value: string) {
    setConfirmName(value)
  }

  async function leaveForCheck() {
    const value = confirmName
    setConfirmName(null)
    if (!value) return
    setPending(true)
    try {
      const result = await directCheck({ name: value })
      // The check page is the public surface for one name, and it
      // picks the search up by its id when one already exists.
      window.location.href = `/check/${encodeURIComponent(value)}?s=${result.search_id}`
    } catch (error) {
      setPending(false)
      toastApiError(error, "Could not start that check.")
    }
  }

  return (
    <div className="space-y-3">
      <Prompter
        onSubmit={(value, mode) =>
          mode === "name"
            ? submitNameOutside(value)
            : void onSubmit(value, mode)
        }
        pending={pending}
      />
      {pending ? (
        <p role="status" className="text-center text-sm text-muted-foreground">
          Starting a sandbox and running the studios. The canvas opens when the
          first ideas land.
        </p>
      ) : null}

      {hasSignals ? null : (
        <div className="mx-auto flex max-w-prose flex-wrap items-center justify-between gap-3 border p-4">
          <p className="text-sm text-muted-foreground">
            Your account steer is empty, so generated ideas run on the brief
            alone. Eight answers make them sharper.
          </p>
          <Link
            href="/dashboard/account?tab=signals"
            className="text-sm font-medium text-primary underline"
          >
            Fill in your steer
          </Link>
        </div>
      )}

      <AlertDialog
        open={confirmName !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmName(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              This will take you out of the dashboard. Continue?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The name check lives on its own page, with domains, handles, and
              the AI associations for {confirmName}. Your work here stays where
              it is.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay here</AlertDialogCancel>
            <AlertDialogAction onClick={() => void leaveForCheck()}>
              Check the name
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
