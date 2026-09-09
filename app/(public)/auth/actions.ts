"use server"

import { redirect } from "next/navigation"

export async function sendMagicLink(formData: FormData) {
  const email = formData.get("email")
  if (typeof email !== "string" || !email) {
    redirect("/auth")
  }

  // TODO: actually send the email

  redirect(`/auth?email=${encodeURIComponent(email)}&sentAt=${Date.now()}`)
}
