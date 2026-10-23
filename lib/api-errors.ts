"use client"

import { toast } from "sonner"
import { ApiError } from "@/lib/api"
import { playSound } from "@/lib/sound/engine"

function billingHref(): string {
  if (typeof window === "undefined") return "/pricing"
  return window.location.pathname.startsWith("/dashboard")
    ? "/dashboard/billing"
    : "/pricing"
}

function messageFor(error: ApiError, fallback: string): string {
  if (error.status === 401) return "Your session ended. Sign in again."
  if (error.status >= 500 || error.status === 0) return fallback
  return error.message || fallback
}

let rateCountdown: ReturnType<typeof setInterval> | null = null

function toastRateLimit(message: string, seconds: number | null): void {
  const id = "rate-limit"
  if (rateCountdown) {
    clearInterval(rateCountdown)
    rateCountdown = null
  }
  if (!seconds || seconds <= 0) {
    toast.error(message, { id, description: "Wait a moment, then try again." })
    return
  }
  // A live countdown instead of "wait": the server told us exactly how
  // long, so the toast counts it down and says when to go again.
  let remaining = seconds
  const render = () => {
    toast.error(message, {
      id,
      description:
        remaining > 0
          ? `Retry available in ${remaining}s.`
          : "You can try that again.",
      duration: (remaining + 2) * 1000,
    })
  }
  render()
  rateCountdown = setInterval(() => {
    remaining -= 1
    if (remaining <= 0) {
      if (rateCountdown) clearInterval(rateCountdown)
      rateCountdown = null
      toast.success("You can try that again.", { id, duration: 3000 })
      return
    }
    render()
  }, 1000)
}

export function toastApiError(error: unknown, fallback: string): void {
  const message =
    error instanceof ApiError ? messageFor(error, fallback) : fallback
  // A soft descending fall rather than a buzz: the toast already says
  // what happened, the sound only says "that didn't go through".
  playSound("error", message)
  if (error instanceof ApiError && error.status === 402) {
    toast.error("You're out of report credits. Top up to keep going.", {
      action: {
        label: "See plans",
        onClick: () => {
          window.location.href = billingHref()
        },
      },
    })
    return
  }
  if (error instanceof ApiError && error.status === 429) {
    // The API's own detail distinguishes a spent allowance ("sign in
    // to keep going") from a transient rate limit; keep it.
    toastRateLimit(
      messageFor(error, "Too many requests. Slow down a little."),
      error.retryAfter
    )
    return
  }
  toast.error(message)
}

export function isShortage(error: unknown): boolean {
  return error instanceof ApiError && error.status === 402
}

export function shortageMessage(error: unknown): string {
  return error instanceof ApiError && error.message
    ? error.message
    : "You're out of report credits. Top up to keep going."
}
