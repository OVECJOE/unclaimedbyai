"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { API_ORIGIN } from "@/lib/api"

async function authed(path: string, init?: RequestInit): Promise<Response> {
  const jar = await cookies()
  const cookie = jar
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ")
  return fetch(`${API_ORIGIN}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
  })
}

export type ProfileState = { error: string | null; saved: boolean }

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const fullName = formData.get("full_name")
  if (typeof fullName !== "string" || !fullName.trim()) {
    return { error: "Enter a name to save.", saved: false }
  }
  const res = await authed("/api/v1/me", {
    method: "PATCH",
    body: JSON.stringify({ full_name: fullName.trim().slice(0, 255) }),
  })
  if (!res.ok) {
    return { error: "We couldn't save your name. Try again.", saved: false }
  }
  revalidatePath("/dashboard/account")
  return { error: null, saved: true }
}

export async function updatePreferences(prefs: {
  report_ready?: boolean
  payment_receipts?: boolean
  product_updates?: boolean
}) {
  const res = await authed("/api/v1/preferences", {
    method: "PATCH",
    body: JSON.stringify(prefs),
  })
  if (!res.ok) throw new Error("Could not save preferences")
  revalidatePath("/dashboard/account")
  return (await res.json()) as {
    report_ready: boolean
    payment_receipts: boolean
    product_updates: boolean
  }
}

export async function deleteAccount(): Promise<{ error: string | null }> {
  const res = await authed("/api/v1/me", { method: "DELETE" })
  if (!res.ok) {
    return { error: "We couldn't delete your account. Try again." }
  }
  const jar = await cookies()
  jar.delete("sid")
  return { error: null }
}
