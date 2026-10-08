"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { requestMagicLink } from "@/lib/api"
import { PENDING_PLAN_COOKIE } from "@/components/public/plan-cookie"

export type MagicLinkState = { error: string | null }

export async function sendMagicLink(
  _prevState: MagicLinkState,
  formData: FormData
): Promise<MagicLinkState> {
  const email = formData.get("email")
  const plan = formData.get("plan")
  const planSlug = typeof plan === "string" && plan.trim() ? plan.trim() : null
  if (typeof email !== "string" || !email.trim()) {
    return { error: "Enter your email address to continue." }
  }

  try {
    await requestMagicLink(email.trim())
  } catch {
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
