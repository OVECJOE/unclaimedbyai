import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"
import { getEditorById } from "./store"
import type { Editor } from "./types"

const COOKIE_NAME = "blog_session"
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7

function secret(): string {
  const value = process.env.BLOG_SESSION_SECRET
  if (!value || value.length < 32) {
    throw new Error("BLOG_SESSION_SECRET must be set to at least 32 characters")
  }
  return value
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url")
}

export async function createSession(editorId: number) {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS
  const payload = `${editorId}.${expires}`

  ;(await cookies()).set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function destroySession() {
  ;(await cookies()).delete(COOKIE_NAME)
}

export const getCurrentEditor = cache(async (): Promise<Editor | null> => {
  const raw = (await cookies()).get(COOKIE_NAME)?.value
  if (!raw) return null

  const [id, expires, signature] = raw.split(".")
  if (!id || !expires || !signature) return null

  const given = Buffer.from(signature)
  const expected = Buffer.from(sign(`${id}.${expires}`))
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return null
  }

  if (Number(expires) < Date.now() / 1000) return null

  return getEditorById(Number(id))
})

export async function requireEditor(): Promise<Editor> {
  const editor = await getCurrentEditor()
  if (!editor) redirect("/admin/login")
  return editor
}
