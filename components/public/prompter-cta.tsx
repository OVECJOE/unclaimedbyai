"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Prompter, { type PrompterMode } from "@/components/app/prompter"
import { useTurnstile } from "@/components/public/turnstile"
import { getAnonSessionId } from "@/lib/anon"
import {
  ApiError,
  createSandbox,
  directCheck,
  generateIdeas,
  getMe,
} from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"

export default function PrompterCta({
  defaultValue = "",
}: {
  defaultValue?: string
}) {
  const [pending, setPending] = useState(false)
  const [lastMode, setLastMode] = useState<PrompterMode>("idea")
  const router = useRouter()
  const turnstile = useTurnstile("anonymous_generate")

  async function onSubmit(value: string, mode: PrompterMode) {
    setPending(true)
    setLastMode(mode)
    try {
      const user = await getMe(5000).catch(() => null)
      if (user) {
        if (mode === "name") {
          const result = await directCheck({ name: value })
          router.push(`/dashboard/history/${result.search_id}`)
          return
        }
        // An idea goes into a sandbox of its own, named after the brief,
        // so the person lands on generated ideas rather than a search
        // they did not ask for.
        const sandbox = await createSandbox({ name: value.slice(0, 80) })
        await generateIdeas(sandbox.public_id, {
          count: 6,
          seed: value.slice(0, 300),
        })
        router.push(`/dashboard/sandbox/${sandbox.public_id}`)
        return
      }
      if (mode === "name") {
        const result = await turnstile.verify((token) =>
          directCheck({
            name: value,
            anon_session_id: getAnonSessionId(),
            cf_turnstile_token: token,
          })
        )
        if (!result) {
          toast.error("The human check did not finish. Try again.")
          return
        }
        router.push(
          `/check/${encodeURIComponent(value)}?s=${result.search_id}&sid=${encodeURIComponent(getAnonSessionId())}`
        )
        return
      }
      // One taste run of idea generation, then a sign-in gate, because
      // running four studios for someone who never intends to sign in is
      // the one thing this funnel cannot afford.
      const sandbox = await turnstile.verify((token) =>
        createSandbox({
          name: value.slice(0, 80),
          anon_session_id: getAnonSessionId(),
          cf_turnstile_token: token,
        })
      )
      if (!sandbox) {
        toast.error("The human check did not finish. Try again.")
        return
      }
      await turnstile.verify((token) =>
        generateIdeas(sandbox.public_id, {
          count: 6,
          seed: value.slice(0, 300),
          anon_session_id: getAnonSessionId(),
          cf_turnstile_token: token,
        })
      )
      router.push(
        `/sandbox/${sandbox.public_id}?sid=${encodeURIComponent(getAnonSessionId())}`
      )
      return
    } catch (error) {
      setPending(false)
      if (error instanceof ApiError && error.status === 403) {
        // verify already waited for a human solve and resent, so a 403
        // here means the fresh token itself was refused. Re-arming the
        // widget gives the next submit something to solve.
        turnstile.reset()
        toast.error(
          "The human check did not run. A browser extension or privacy setting may be blocking Cloudflare; try a private window."
        )
        return
      }
      toastApiError(error, "Something went wrong. Try again.")
    }
  }

  return (
    <div className="space-y-3">
      <Prompter
        onSubmit={(value, mode) => void onSubmit(value, mode)}
        pending={pending}
        defaultValue={defaultValue}
      />
      {pending ? (
        <p role="status" className="text-center text-sm text-muted-foreground">
          {lastMode === "name"
            ? "Checking that name. Domains and handles stream in as they come back."
            : "Starting your search… you'll see names arrive live."}
        </p>
      ) : null}
      {turnstile.widget}
    </div>
  )
}
