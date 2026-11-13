import { getPostBoostCount } from "@/lib/blog/store"
import BoostButton from "./boost-button"

export default async function PostBoost({ postId }: { postId: number }) {
  const count = await getPostBoostCount(postId)

  return (
    <div className="mx-auto max-w-[44.5rem] px-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-y py-5">
        <p className="font-heading text-xl">Was this worth your time?</p>
        <BoostButton postId={postId} count={count} boosted={false} />
      </div>
    </div>
  )
}
