"use server"

import { redirect } from "next/navigation"
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

export async function updateProfile(formData: FormData) {
  const fullName = formData.get("full_name")
  if (typeof fullName !== "string" || !fullName.trim()) return
  await authed("/api/v1/me", {
    method: "PATCH",
    body: JSON.stringify({ full_name: fullName.trim().slice(0, 255) }),
  })
  revalidatePath("/dashboard/account")
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

export async function deleteAccount() {
  await authed("/api/v1/me", { method: "DELETE" })
  const jar = await cookies()
  jar.delete("sid")
  redirect("/")
}
