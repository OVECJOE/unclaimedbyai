"use server"

import { randomBytes } from "node:crypto"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { SITE_URL } from "@/lib/site"
import { sendLoginEmail } from "./email"
import { createSession, destroySession, requireEditor } from "./session"
import {
  consumeLoginToken,
  createPost,
  getEditorByEmail,
  hashToken,
  storeLoginToken,
  updatePost,
} from "./store"
import { validateMdx } from "./validate"
import type { ContentIssue, LoginState, PostInput, SaveResult } from "./types"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
const RESERVED_SLUGS = new Set(["page"])

function revalidateBlog(slugs: string[]) {
  revalidatePath("/blog")
  revalidatePath("/blog/page/[page]", "page")
  for (const slug of slugs) revalidatePath(`/blog/${slug}`)
  revalidatePath("/sitemap.xml")
}

function origin(): string {
  return process.env.NODE_ENV === "production"
    ? SITE_URL
    : "http://localhost:3000"
}

export async function requestLoginLink(
  _previous: LoginState,
  formData: FormData
): Promise<LoginState> {
  const raw = formData.get("email")
  const email = typeof raw === "string" ? raw.trim() : ""

  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", message: "Enter a valid email address." }
  }

  const editor = await getEditorByEmail(email)

  if (editor) {
    const token = randomBytes(32).toString("base64url")
    const stored = await storeLoginToken(editor.id, hashToken(token))

    if (stored) {
      try {
        await sendLoginEmail(
          editor.email,
          `${origin()}/admin/verify?token=${token}`
        )
      } catch (error) {
        console.error("Blog admin sign-in email failed", error)
      }
    }
  }

  return {
    status: "sent",
    message:
      "If that email belongs to an editor, a sign-in link is on its way. It expires in 15 minutes.",
  }
}

export async function verifyLoginToken(formData: FormData) {
  const token = formData.get("token")
  const editor =
    typeof token === "string" && token
      ? await consumeLoginToken(hashToken(token))
      : null

  if (!editor) redirect("/admin/login?error=link")

  await createSession(editor.id)
  redirect("/admin/blog")
}

export async function signOut() {
  await destroySession()
  redirect("/admin/login")
}

function checkFields(input: PostInput): ContentIssue[] {
  const issues: ContentIssue[] = []

  if (!input.title.trim()) issues.push({ message: "Add a title." })
  if (!SLUG_PATTERN.test(input.slug)) {
    issues.push({
      message:
        "The URL slug can only contain lowercase letters, numbers and hyphens.",
    })
  }
  if (RESERVED_SLUGS.has(input.slug)) {
    issues.push({ message: "That URL slug is reserved. Pick another." })
  }
  if (input.status === "published") {
    if (!input.excerpt.trim()) {
      issues.push({ message: "Add an excerpt before publishing." })
    }
    if (!input.bodyMdx.trim()) issues.push({ message: "The post is empty." })
  }

  return issues
}

export async function savePost(input: PostInput): Promise<SaveResult> {
  const editor = await requireEditor()

  const issues = [...checkFields(input), ...validateMdx(input.bodyMdx)]
  if (issues.length) return { ok: false, issues }

  try {
    if (input.id) {
      const updated = await updatePost(input.id, input, editor.id)
      if (!updated) {
        return {
          ok: false,
          issues: [{ message: "This post no longer exists." }],
        }
      }

      revalidateBlog([updated.post.slug, updated.previousSlug])

      return { ok: true, post: updated.post }
    }

    const post = await createPost(input, editor.id)

    revalidateBlog([post.slug])

    return { ok: true, post }
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return {
        ok: false,
        issues: [{ message: "Another post already uses that URL slug." }],
      }
    }
    console.error("Saving blog post failed", error)
    return {
      ok: false,
      issues: [{ message: "Could not save the post. Try again in a moment." }],
    }
  }
}
