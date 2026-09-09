"use server"

export type WaitlistState = {
  status: "idle" | "success" | "error"
  message?: string
}

export async function addToWaitlist(
  _prev: WaitlistState,
  formData: FormData
): Promise<WaitlistState> {
  const email = formData.get("email")
  const normalized = typeof email === "string" ? email.trim() : ""
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)

  if (!valid) {
    return { status: "error", message: "Enter a valid email address." }
  }

  const endpoint = process.env.BASIN_ENDPOINT
  if (!endpoint) {
    return {
      status: "error",
      message: "The waitlist isn't connected yet. Try again in a bit.",
    }
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: normalized }),
    })
    const data = (await res.json().catch(() => null)) as
      | { success?: boolean }
      | null

    if (!res.ok || !data?.success) {
      return {
        status: "error",
        message: "Couldn't save your email. Try again in a moment.",
      }
    }

    return { status: "success", message: "You're on the list — we'll be in touch." }
  } catch {
    return { status: "error", message: "Network error. Please try again." }
  }
}