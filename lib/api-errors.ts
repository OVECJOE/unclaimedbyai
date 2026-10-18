"use client"

import { toast } from "sonner"
import { ApiError } from "@/lib/api"

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

export function toastApiError(error: unknown, fallback: string): void {
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
    toast.error("Too many requests. Wait a moment, then try again.")
    return
  }
  toast.error(
    error instanceof ApiError ? messageFor(error, fallback) : fallback
  )
}

export function isShortage(error: unknown): boolean {
  return error instanceof ApiError && error.status === 402
}

export function shortageMessage(error: unknown): string {
  return error instanceof ApiError && error.message
    ? error.message
    : "You're out of report credits. Top up to keep going."
}
