"use server"

import { redirect } from "next/navigation"
import { requestMagicLink } from "@/lib/api"

export async function sendMagicLink(formData: FormData) {
  const email = formData.get("email")
  if (typeof email !== "string" || !email.trim()) {
    redirect("/auth")
  }

  try {
    await requestMagicLink(email.trim())
  } catch {
    redirect("/auth")
  }

  redirect(
    `/auth?email=${encodeURIComponent(email.trim())}&sentAt=${Date.now()}`
  )
}
