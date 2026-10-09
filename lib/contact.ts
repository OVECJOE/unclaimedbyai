"use server"

import { SITE_NAME } from "@/lib/site"

export type ContactState = { ok: boolean; message: string }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TOPICS = new Set(["support", "billing", "press", "privacy", "other"])

const TOPIC_LABELS: Record<string, string> = {
  support: "Support",
  billing: "Billing",
  press: "Press",
  privacy: "Privacy request",
  other: "Something else",
}

export async function sendContactMessage(
  _previous: ContactState,
  formData: FormData
): Promise<ContactState> {
  // Honeypot: real users never fill this. Pretend success so bots learn nothing.
  const honeypot = formData.get("website")
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { ok: true, message: "Thanks, we'll be in touch." }
  }

  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const topic = String(formData.get("topic") ?? "").trim()
  const message = String(formData.get("message") ?? "").trim()
  const started = Number(formData.get("started") ?? 0)

  if (name.length < 1 || name.length > 120) {
    return { ok: false, message: "Tell us what to call you (1-120 characters)." }
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { ok: false, message: "That email doesn't look right." }
  }
  if (!TOPICS.has(topic)) {
    return { ok: false, message: "Pick what this is about." }
  }
  if (message.length < 10 || message.length > 5000) {
    return {
      ok: false,
      message: "Messages need 10-5000 characters. The details help us help you.",
    }
  }
  // Submitted suspiciously fast, almost certainly a script. Accept quietly.
  if (started > 0 && Date.now() - started < 2000) {
    return { ok: true, message: "Thanks, we'll be in touch." }
  }

  const key = process.env.RESEND_API_KEY
  const from = process.env.BLOG_EMAIL_FROM

  if (!key || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `Contact message (${TOPIC_LABELS[topic]}) from ${name} <${email}>:\n${message}`
      )
      return {
        ok: true,
        message: "Got it. In development this prints to the server log.",
      }
    }
    console.error("Contact form unavailable: RESEND_API_KEY/BLOG_EMAIL_FROM unset")
    return {
      ok: false,
      message: "The form is unavailable right now. Email hello@unclaimedbyai.com.",
    }
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: ["hello@unclaimedbyai.com"],
        reply_to: email,
        subject: `[${SITE_NAME} contact] ${TOPIC_LABELS[topic]}: ${name}`,
        text: `${message}\n\n- ${name}\n${email}`,
      }),
    })
    if (!res.ok) {
      console.error(`Resend responded with ${res.status}`)
      return {
        ok: false,
        message: "Couldn't send that. Email hello@unclaimedbyai.com instead.",
      }
    }
    return { ok: true, message: "Message sent. We'll reply by email." }
  } catch (error) {
    console.error("Contact email failed", error)
    return {
      ok: false,
      message: "Couldn't send that. Email hello@unclaimedbyai.com instead.",
    }
  }
}
