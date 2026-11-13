"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Prompter, { type PrompterMode } from "@/components/app/prompter"
import {
  createSandbox,
  directCheck,
  generateFilledSearch,
  generateIdeas,
  type SignalProfile,
} from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import { nameToSlug } from "@/lib/utils"

/**
 * The prompter inside the dashboard. Idea runs the brief through the
 * naming pipeline and lands on the live report — its promise is
 * names. Studio builds a sandbox of business ideas shaped by the
 * steer. A name goes straight to its live check page; everything on
 * the dashboard is saved, so there is nothing to confirm. A deep link
 * (?brief=…&mode=…) prefills the box, which is how a failed search
 * offers its retry. Studio mode shows an
 * onboarding nudge when the account steer is still empty, because a
 * new signup's ideas are only as good as the answers it gets.
 */
export default function DashboardPrompter({
  hasSignals,
}: {
  hasSignals: boolean
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [lastMode, setLastMode] = useState<PrompterMode>("idea")
  const [prefill, setPrefill] = useState<{
    brief: string
    mode: PrompterMode
  } | null>(null)

  // Read once on mount from window, then take the params back out of
  // the address bar so a refresh doesn't re-seed the box.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const brief = params.get("brief")
    const rawMode = params.get("mode")
    if (brief === null && rawMode === null) return
    const mode: PrompterMode =
      rawMode === "name" || rawMode === "studio" ? rawMode : "idea"
    params.delete("brief")
    params.delete("mode")
    const query = params.toString()
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`
    )
    const id = window.setTimeout(
      () => setPrefill({ brief: (brief ?? "").slice(0, 400), mode }),
      0
    )
    return () => window.clearTimeout(id)
  }, [])

  async function runStudio(
    value: string,
    signals?: Partial<SignalProfile>
  ) {
    const sandbox = await createSandbox({
      name: value.slice(0, 80),
      ...(signals ? { signals } : {}),
    })
    try {
      await generateIdeas(sandbox.public_id, {
        count: 6,
        seed: value.slice(0, 300),
      })
    } catch (error) {
      // The sandbox exists now, so land on the canvas where the failed
      // run is visible and retryable, instead of leaving an empty
      // sandbox nobody was told about.
      router.push(`/dashboard/playground?sandbox=${sandbox.public_id}`)
      throw error
    }
    router.push(`/dashboard/playground?sandbox=${sandbox.public_id}`)
  }

  async function onSubmit(
    value: string,
    mode: PrompterMode,
    signals?: Partial<SignalProfile>
  ) {
    setPending(true)
    setLastMode(mode)
    try {
      if (mode === "studio") {
        await runStudio(value, signals)
        return
      }
      // Idea mode: the brief goes through the naming pipeline and the
      // live report streams the results.
      const search = await generateFilledSearch({ query: value, count: 12 })
      router.push(`/dashboard/history/${search.id}`)
    } catch (error) {
      setPending(false)
      toastApiError(error, "Something went wrong. Try again.")
    }
  }

  async function runNameCheck(value: string) {
    setPending(true)
    setLastMode("name")
    try {
      const result = await directCheck({ name: value })
      // The check page is the public surface for one name, and it
      // picks the search up by its id when one already exists.
      router.push(`/check/${nameToSlug(value)}?s=${result.search_id}`)
    } catch (error) {
      setPending(false)
      toastApiError(error, "Could not start that check.")
    }
  }

  return (
    <div className="space-y-3">
      <Prompter
        key={prefill ? "prefilled" : "prompter"}
        defaultValue={prefill?.brief ?? ""}
        defaultMode={prefill?.mode ?? "idea"}
        onSubmit={(value, mode, signals) =>
          mode === "name"
            ? void runNameCheck(value)
            : void onSubmit(value, mode, signals)
        }
        pending={pending}
      />
      {pending ? (
        <p role="status" className="text-center text-sm text-muted-foreground">
          {lastMode === "name"
            ? "Starting the check. It opens on its own page in a moment."
            : lastMode === "studio"
              ? "Starting a sandbox and running the strategy studios. The canvas opens when the first ideas land."
              : "Running the naming studios. Your report opens as the names stream in."}
        </p>
      ) : null}

      {hasSignals ? null : (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-dashed p-4">
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
    </div>
  )
}
