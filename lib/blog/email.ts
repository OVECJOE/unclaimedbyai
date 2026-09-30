import "server-only"
import { SITE_NAME } from "@/lib/site"

export async function sendLoginEmail(to: string, link: string) {
  const key = process.env.RESEND_API_KEY
  const from = process.env.BLOG_EMAIL_FROM

  if (!key || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`Blog admin sign-in link for ${to}: ${link}`)
      return
    }
    throw new Error("RESEND_API_KEY and BLOG_EMAIL_FROM must be set")
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Sign in to the ${SITE_NAME} blog admin`,
      text: `Use this link to sign in. It expires in 15 minutes and works once.\n\n${link}\n\nIf you did not ask for it, you can ignore this email.`,
    }),
  })

  if (!res.ok) {
    throw new Error(`Resend responded with ${res.status}`)
  }
}
