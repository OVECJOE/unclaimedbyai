import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  approveComment,
  deleteCommentAction,
  rejectComment,
} from "@/lib/blog/actions"
import {
  countPendingComments,
  listPendingComments,
  listRecentApprovedComments,
} from "@/lib/blog/store"
import type { AdminCommentRow } from "@/lib/blog/types"
import { formatDateTime } from "@/lib/utils"

function ModerationButtons({ id }: { id: number }) {
  return (
    <div className="flex gap-2">
      <form action={approveComment}>
        <input type="hidden" name="id" value={id} />
        <Button type="submit" size="sm">
          Approve
        </Button>
      </form>
      <form action={rejectComment}>
        <input type="hidden" name="id" value={id} />
        <Button type="submit" variant="outline" size="sm">
          Reject
        </Button>
      </form>
    </div>
  )
}

function CommentCard({
  comment,
  children,
}: {
  comment: AdminCommentRow
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2 border p-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold">{comment.authorName}</span>
        <span className="text-muted-foreground">
          {formatDateTime(comment.createdAt)}
        </span>
        <Link
          href={`/blog/${comment.postSlug}`}
          target="_blank"
          className="text-primary underline-offset-4 hover:underline"
        >
          {comment.postTitle || "Untitled"}
        </Link>
        {comment.parentId !== null ? (
          <Badge variant="secondary">reply</Badge>
        ) : null}
      </div>
      <p className="text-[0.95rem] leading-relaxed break-words whitespace-pre-wrap">
        {comment.body}
      </p>
      {children}
    </div>
  )
}

export default async function AdminCommentsPage() {
  const [pending, approved, pendingCount] = await Promise.all([
    listPendingComments(),
    listRecentApprovedComments(20),
    countPendingComments(),
  ])

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-4xl font-semibold">Comments</h1>
        {pendingCount ? (
          <Badge variant="default">{pendingCount} pending</Badge>
        ) : null}
      </div>

      <section className="space-y-4">
        <h2 className="font-heading text-2xl">Awaiting approval</h2>
        {pending.length ? (
          <div className="space-y-4">
            {pending.map((comment) => (
              <CommentCard key={comment.id} comment={comment}>
                <ModerationButtons id={comment.id} />
              </CommentCard>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Queue clear. Nothing awaiting approval.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-2xl">Recently approved</h2>
        {approved.length ? (
          <div className="space-y-4">
            {approved.map((comment) => (
              <CommentCard key={comment.id} comment={comment}>
                <form action={deleteCommentAction}>
                  <input type="hidden" name="id" value={comment.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    Delete
                  </Button>
                </form>
              </CommentCard>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No approved comments yet.</p>
        )}
      </section>
    </div>
  )
}
