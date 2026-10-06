import { cookies } from "next/headers"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  getCommentBoostCounts,
  listApprovedComments,
  listMyBoostedCommentIds,
} from "@/lib/blog/store"
import type { BlogComment } from "@/lib/blog/types"
import BoostButton from "./boost-button"
import CommentForm from "./comment-form"
import ReplyToggle from "./reply-toggle"

const dateFormat = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
})

function SignalAvatar({ name }: { name: string }) {
  return (
    <Avatar className="size-9 shrink-0 rounded-none after:rounded-none">
      <AvatarImage
        src={`https://api.dicebear.com/10.x/adventurer-neutral/svg?seed=${encodeURIComponent(name)}`}
        alt=""
        className="rounded-none"
      />
      <AvatarFallback className="rounded-none bg-primary/10 font-heading text-lg text-primary">
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}

function CommentItem({
  postId,
  comment,
  boostCounts,
  boostedIds,
}: {
  postId: number
  comment: BlogComment
  boostCounts: Record<number, number>
  boostedIds: Set<number>
}) {
  return (
    <div className="flex gap-3">
      <SignalAvatar name={comment.authorName} />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm">
          <span className="font-semibold">{comment.authorName}</span>{" "}
          <time dateTime={comment.createdAt} className="text-muted-foreground">
            {dateFormat.format(new Date(comment.createdAt))}
          </time>
        </p>
        <p className="text-[0.95rem] leading-relaxed break-words whitespace-pre-wrap">
          {comment.body}
        </p>
        <div className="flex flex-wrap items-center gap-1 pt-1">
          <BoostButton
            postId={postId}
            commentId={comment.id}
            count={boostCounts[comment.id] ?? 0}
            boosted={boostedIds.has(comment.id)}
          />
          <ReplyToggle
            postId={postId}
            parentId={comment.id}
            authorName={comment.authorName}
          />
        </div>
        {comment.replies.length ? (
          <div className="space-y-4 border-l-2 border-border pt-4 pl-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                postId={postId}
                comment={reply}
                boostCounts={boostCounts}
                boostedIds={boostedIds}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default async function CommentSection({ postId }: { postId: number }) {
  const jar = await cookies()
  const fingerprint = jar.get("bid")?.value ?? null
  const [comments, boostCounts, boostedList] = await Promise.all([
    listApprovedComments(postId),
    getCommentBoostCounts(postId),
    listMyBoostedCommentIds(postId, fingerprint),
  ])
  const boostedIds = new Set(boostedList)
  const total =
    comments.length +
    comments.reduce((sum, comment) => sum + comment.replies.length, 0)

  return (
    <section
      aria-labelledby="transmissions-heading"
      className="mx-auto max-w-7xl space-y-6 border-t px-4 py-10"
    >
      <div className="max-w-prose space-y-2">
        <h2
          id="transmissions-heading"
          className="font-heading text-3xl font-semibold"
        >
          Transmissions <span className="text-primary">[{total}]</span>
        </h2>
        <p className="text-muted-foreground md:text-lg">
          This channel is open to anyone with something worth saying. Every
          transmission is reviewed before it goes live, so give yours a moment
          to land.
        </p>
      </div>

      {comments.length ? (
        <ol className="space-y-6">
          {comments.map((comment) => (
            <li key={comment.id}>
              <CommentItem
                postId={postId}
                comment={comment}
                boostCounts={boostCounts}
                boostedIds={boostedIds}
              />
            </li>
          ))}
        </ol>
      ) : (
        <p className="border border-dashed p-8 text-center text-muted-foreground">
          Dead air so far, which means the first transmission on this post is
          yours to send.
        </p>
      )}

      <div className="border p-4 sm:p-6">
        <CommentForm postId={postId} />
      </div>
    </section>
  )
}
