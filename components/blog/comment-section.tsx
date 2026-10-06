import { listApprovedComments } from "@/lib/blog/store"
import type { BlogComment } from "@/lib/blog/types"
import CommentForm from "./comment-form"
import ReplyToggle from "./reply-toggle"

const dateFormat = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
})

function SignalAvatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center bg-primary/10 font-heading text-lg text-primary"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

function CommentItem({
  postId,
  comment,
}: {
  postId: number
  comment: BlogComment
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
        <ReplyToggle postId={postId} parentId={comment.id} />
        {comment.replies.length ? (
          <div className="space-y-4 border-l-2 border-border pt-4 pl-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} postId={postId} comment={reply} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default async function CommentSection({ postId }: { postId: number }) {
  const comments = await listApprovedComments(postId)
  const total =
    comments.length +
    comments.reduce((sum, comment) => sum + comment.replies.length, 0)

  return (
    <section
      aria-labelledby="transmissions-heading"
      className="mx-auto max-w-7xl space-y-6 border-t px-4 py-10"
    >
      <div className="space-y-1">
        <h2
          id="transmissions-heading"
          className="font-heading text-3xl font-semibold"
        >
          Transmissions{" "}
          <span className="font-mono text-lg text-primary">[{total}]</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Open channel — new transmissions appear once approved.
        </p>
      </div>

      {comments.length ? (
        <ol className="space-y-6">
          {comments.map((comment) => (
            <li key={comment.id}>
              <CommentItem postId={postId} comment={comment} />
            </li>
          ))}
        </ol>
      ) : (
        <p className="border border-dashed p-6 text-center text-muted-foreground">
          No transmissions yet — open the channel below.
        </p>
      )}

      <div className="border bg-muted/40 p-4 sm:p-6">
        <CommentForm postId={postId} />
      </div>
    </section>
  )
}
