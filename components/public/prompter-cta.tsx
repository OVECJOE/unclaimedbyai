"use client"

import { useEffect, useRef, useState } from "react"
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
  type SignalProfile,
  type ApiUser,
} from "@/lib/api"
import { toastApiError } from "@/lib/api-errors"
import { nameToSlug } from "@/lib/utils"

/**
 * The prompter's public wiring. Signed in, an idea becomes a sandbox
 * plus a run and lands on the canvas; a name goes straight to its
 * check. Signed out, the same two paths run through the one anonymous
 * taste run and Turnstile, and a name lands on the public check page.
 */
export default function PrompterCta({
  defaultValue = "",
  signedIn,
}: {
  defaultValue?: string
  /** Known auth state from the server. Left unresolved, one light
   *  getMe on mount settles it so the studio fields ask only visitors. */
  signedIn?: boolean
}) {
  const [pending, setPending] = useState(false)
  const [lastMode, setLastMode] = useState<PrompterMode>("idea")
  const [known, setKnown] = useState<boolean | null>(signedIn ?? null)
  const userRef = useRef<ApiUser | null>(null)
  const router = useRouter()
  const turnstile = useTurnstile("anonymous_generate")

  useEffect(() => {
    if (known !== null) return
    let cancelled = false
    void getMe(5000)
      .then((user) => {
        if (cancelled) return
        userRef.current = user
        setKnown(true)
      })
      .catch(() => {
        if (!cancelled) setKnown(false)
      })
    return () => {
      cancelled = true
    }
  }, [known])

  async function resolveUser(): Promise<ApiUser | null> {
    if (userRef.current !== null) return userRef.current
    const user = await getMe(5000).catch(() => null)
    userRef.current = user
    return user
  }

  async function onSubmit(
    value: string,
    mode: PrompterMode,
    signals?: Partial<SignalProfile>
  ) {
    setPending(true)
    setLastMode(mode)
    try {
      const user = await resolveUser()
      if (user) {
        if (mode === "name") {
          const result = await directCheck({ name: value })
          // The check page streams the run live for its owner; a
          // history entry is not created, because a check is not a
          // search.
          router.push(`/check/${nameToSlug(value)}?s=${result.search_id}`)
          return
        }
        // An idea goes into a sandbox of its own, named after the brief,
        // so the person lands on generated ideas rather than a search
        // they did not ask for. The canvas opens on the new sandbox.
        const sandbox = await createSandbox({ name: value.slice(0, 80) })
        try {
          await generateIdeas(sandbox.public_id, {
            count: 6,
            seed: value.slice(0, 300),
          })
        } catch (error) {
          // The sandbox exists; land there anyway so nothing is
          // stranded and the upgrade or retry path is one click away.
          toastApiError(error, "Ideas could not start.")
          router.push(`/dashboard/playground?sandbox=${sandbox.public_id}`)
          return
        }
        router.push(`/dashboard/playground?sandbox=${sandbox.public_id}`)
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
          `/check/${nameToSlug(value)}?s=${result.search_id}&sid=${encodeURIComponent(getAnonSessionId())}`
        )
        return
      }
      // One taste run of idea generation, then a sign-in gate, because
      // running four studios for someone who never intends to sign in is
      // the one thing this funnel cannot afford. Studio mode sends the
      // inline steer along so the run is shaped by it.
      const sandbox = await turnstile.verify(
        (token) =>
          createSandbox({
            name: value.slice(0, 80),
            signals: mode === "studio" ? signals : undefined,
            anon_session_id: getAnonSessionId(),
            cf_turnstile_token: token,
          }),
        { waitMs: 30000 }
      )
      if (!sandbox) {
        toast.error("The human check did not finish. Try again.")
        return
      }
      const generated = await turnstile.verify(
        (token) =>
          generateIdeas(
            sandbox.public_id,
            {
              count: 6,
              seed: value.slice(0, 300),
              anon_session_id: getAnonSessionId(),
              cf_turnstile_token: token,
            },
            getAnonSessionId()
          ),
        { waitMs: 30000 }
      )
      if (!generated) {
        const sid = getAnonSessionId()
        toast.error(
          "The human check did not finish, so your ideas never generated. Your sandbox is saved.",
          {
            action: {
              label: "Open sandbox",
              onClick: () =>
                router.push(
                  `/sandbox/${sandbox.public_id}?sid=${encodeURIComponent(sid)}`
                ),
            },
          }
        )
        return
      }
      router.push(
        `/sandbox/${sandbox.public_id}?sid=${encodeURIComponent(getAnonSessionId())}`
      )
    } catch (error) {
      const humanCheckFailed =
        error instanceof ApiError &&
        error.status === 403 &&
        error.message.toLowerCase().includes("human verification")
      if (humanCheckFailed) {
        // verify already waited for a human solve and resent, so a 403
        // here means the fresh token itself was refused. Re-arming the
        // widget gives the next submit something to solve.
        turnstile.reset()
        toast.error(
          "The human check did not run. Allow challenges.cloudflare.com and try again — or sign in to skip it."
        )
        return
      }
      if (
        error instanceof ApiError &&
        error.status === 403 &&
        error.message.includes("Sign in")
      ) {
        // A product limit wearing a 403: the answer is an account,
        // not another captcha.
        toast.error(error.message, {
          action: {
            label: "Sign in",
            onClick: () =>
              router.push(
                `/auth?next=${encodeURIComponent(window.location.pathname)}`
              ),
          },
        })
        return
      }
      toastApiError(error, "Something went wrong. Try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-3">
      <Prompter
        onSubmit={(value, mode, signals) => void onSubmit(value, mode, signals)}
        pending={pending}
        defaultValue={defaultValue}
        // A signed-in visitor's steer lives on the account, so the
        // inline fields would ask twice. Unknown counts as signed out
        // until the mount check says otherwise.
        showSignalFields={known === false}
      />
      {pending ? (
        <p role="status" className="text-center text-sm text-muted-foreground">
          {lastMode === "name"
            ? "Checking that name. Domains and handles stream in as they come back."
            : "Starting your search… if a human check appears below, solve it to continue."}
        </p>
      ) : null}
      {turnstile.widget}
    </div>
  )
}
