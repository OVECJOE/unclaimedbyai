"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { API_BASE } from "@/lib/api"

export async function signOut() {
  const jar = await cookies()
  const cookie = jar
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ")
  try {
    await fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: "POST",
      headers: cookie ? { cookie } : {},
    })
  } catch {
    // fall through to local redirect either way
  }
  redirect("/")
}
