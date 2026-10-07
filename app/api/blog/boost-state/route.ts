import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  getCommentBoostCounts,
  getPostBoostCount,
  hasBoosted,
  listMyBoostedCommentIds,
} from "@/lib/blog/store"

export async function GET(request: Request) {
  const postId = Number.parseInt(
    new URL(request.url).searchParams.get("postId") ?? "",
    10
  )
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: "Invalid post" }, { status: 400 })
  }

  const fingerprint = (await cookies()).get("bid")?.value ?? null
  const [count, counts, postBoosted, boostedList] = await Promise.all([
    getPostBoostCount(postId),
    getCommentBoostCounts(postId),
    hasBoosted(postId, null, fingerprint),
    listMyBoostedCommentIds(postId, fingerprint),
  ])

  return NextResponse.json({
    post: { count },
    comments: counts,
    boosted: { post: postBoosted, comments: boostedList },
  })
}
