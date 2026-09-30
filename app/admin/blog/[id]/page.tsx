import { notFound } from "next/navigation"
import PostForm from "@/components/admin/post-form"
import { getPostById } from "@/lib/blog/store"

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const postId = Number(id)
  if (!Number.isInteger(postId)) notFound()

  const post = await getPostById(postId)
  if (!post) notFound()

  return <PostForm post={post} />
}
