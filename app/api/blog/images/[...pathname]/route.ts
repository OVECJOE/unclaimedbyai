import { get } from "@vercel/blob"
import { NextResponse } from "next/server"

type Params = { params: Promise<{ pathname: string[] }> }

export async function GET(_request: Request, { params }: Params) {
  const { pathname } = await params

  if (
    pathname.length === 0 ||
    pathname[0] !== "blog" ||
    pathname.some(
      (segment) => segment === "" || segment === "." || segment === ".."
    )
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    const result = await get(pathname.join("/"), { access: "private" })
    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return new Response(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType,
        "Content-Length": String(result.blob.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}
