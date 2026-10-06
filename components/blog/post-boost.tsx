import { cookies } from "next/headers"
import { getPostBoostCount, hasBoosted } from "@/lib/blog/store"
import BoostButton from "./boost-button"

export default async function PostBoost({ postId }: { postId: number }) {
  const jar = await cookies()
  const fingerprint = jar.get("bid")?.value ?? null
  const [count, boosted] = await Promise.all([
    getPostBoostCount(postId),
    hasBoosted(postId, null, fingerprint),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10">
      <BoostButton postId={postId} count={count} boosted={boosted} />
    </div>
  )
}
