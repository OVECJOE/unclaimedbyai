"use client"

import { toast } from "sonner"
import { ApiError } from "@/lib/api"

export function toastApiError(error: unknown, fallback: string): void {
  if (error instanceof ApiError && error.status === 402) {
    toast.error("You're out. Top up to keep going.", {
      action: {
        label: "See plans",
        onClick: () => {
          window.location.href = "/pricing"
        },
      },
    })
    return
  }
  if (error instanceof ApiError && error.status === 429) {
    toast.error("Too many requests. Wait a moment, then try again.")
    return
  }
  toast.error(error instanceof ApiError ? error.message : fallback)
}
