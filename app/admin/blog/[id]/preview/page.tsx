import { notFound } from "next/navigation"
import PostArticle from "@/components/blog/post-article"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getPostById } from "@/lib/blog/store"

export default async function PreviewPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const postId = Number(id)
  if (!Number.isInteger(postId)) notFound()

  const post = await getPostById(postId)
  if (!post) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <Alert>
        <AlertDescription>
          Preview of the last saved version.{" "}
          {post.status === "published"
            ? "This post is live."
            : "This post is not public until you publish it."}
        </AlertDescription>
      </Alert>
      <PostArticle post={post} />
    </div>
  )
}
