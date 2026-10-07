import { imageSize } from "image-size"
import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { getCurrentEditor } from "@/lib/blog/session"

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
])
const MAX_BYTES = 4 * 1024 * 1024

export async function POST(request: Request) {
  const editor = await getCurrentEditor()
  if (!editor) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }

  const form = await request.formData()
  const file = form.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Use a PNG, JPEG, WebP, GIF or AVIF image" },
      { status: 415 }
    )
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Images must be 4 MB or smaller" },
      { status: 413 }
    )
  }

  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-")
  const bytes = Buffer.from(await file.arrayBuffer())
  let width: number | null = null
  let height: number | null = null
  try {
    const dims = imageSize(bytes)
    if (dims.width && dims.height) {
      width = dims.width
      height = dims.height
    }
  } catch {
    width = null
    height = null
  }
  const blob = await put(`blog/${safeName}`, bytes, {
    access: "private",
    addRandomSuffix: true,
    contentType: file.type,
  })

  return NextResponse.json({
    url: `/api/blog/images/${blob.pathname}`,
    width,
    height,
  })
}
