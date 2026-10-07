import { getPostBoostCount } from "@/lib/blog/store"
import BoostButton from "./boost-button"

export default async function PostBoost({ postId }: { postId: number }) {
  const count = await getPostBoostCount(postId)

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10">
      <BoostButton postId={postId} count={count} boosted={false} />
    </div>
  )
}
