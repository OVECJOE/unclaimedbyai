"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { API_ORIGIN } from "@/lib/api"

export async function signOut() {
  const jar = await cookies()
  const cookie = jar
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join("; ")
  try {
    await fetch(`${API_ORIGIN}/api/v1/auth/logout`, {
      method: "POST",
      headers: cookie ? { cookie } : {},
    })
  } catch {
    // fall through to local sign-out either way
  }
  // The API's Set-Cookie deletion header never reaches the browser through
  // this server-side fetch, so drop the session cookie locally too.
  jar.delete("sid")
  redirect("/")
}
