"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ApiError, requestMagicLink } from "@/lib/api"
import { PENDING_PLAN_COOKIE } from "@/components/public/plan-cookie"

export type MagicLinkState = { error: string | null }

export async function sendMagicLink(
  _prevState: MagicLinkState,
  formData: FormData
): Promise<MagicLinkState> {
  const email = formData.get("email")
  const plan = formData.get("plan")
  const turnstileToken = formData.get("cf_turnstile_token")
  const planSlug = typeof plan === "string" && plan.trim() ? plan.trim() : null
  if (typeof email !== "string" || !email.trim()) {
    return { error: "Enter your email address to continue." }
  }

  try {
    await requestMagicLink(
      email.trim(),
      typeof turnstileToken === "string" && turnstileToken
        ? turnstileToken
        : undefined
    )
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      return {
        error:
          "A sign-in link is already on its way to that address. Give it a few minutes.",
      }
    }
    if (error instanceof ApiError && error.status === 403) {
      return {
        error:
          "The human check didn't pass. Try again in a moment — it's usually instant.",
      }
    }
    return {
      error: "We couldn't send that link. Check your connection and try again.",
    }
  }

  if (planSlug) {
    const jar = await cookies()
    jar.set(PENDING_PLAN_COOKIE, planSlug, {
      path: "/",
      maxAge: 3600,
      sameSite: "lax",
    })
  }
  const params = new URLSearchParams({
    email: email.trim(),
    sentAt: String(Date.now()),
  })
  if (planSlug) params.set("plan", planSlug)
  redirect(`/auth?${params.toString()}`)
}
