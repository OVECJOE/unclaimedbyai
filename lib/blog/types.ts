export type PostStatus = "draft" | "published"

export type Editor = {
  id: number
  email: string
  name: string
  avatarUrl: string | null
}

export type PostAuthor = {
  name: string
  avatarUrl: string | null
}

export type PostSummary = {
  id: number
  slug: string
  title: string
  excerpt: string
  coverImageUrl: string | null
  coverImageWidth: number | null
  coverImageHeight: number | null
  publishedAt: string | null
  updatedAt: string
  author: PostAuthor
  tags: string[]
}

export type Post = PostSummary & {
  bodyMdx: string
  status: PostStatus
  seoTitle: string | null
  seoDescription: string | null
}

export type AdminPostRow = {
  id: number
  slug: string
  title: string
  status: PostStatus
  updatedAt: string
  authorName: string
}

export type PostRedirect = { redirectTo: string }

export type PostInput = {
  id?: number
  slug: string
  title: string
  excerpt: string
  coverImageUrl: string | null
  coverImageWidth: number | null
  coverImageHeight: number | null
  bodyMdx: string
  status: PostStatus
  seoTitle: string | null
  seoDescription: string | null
  tags: string[]
}

export type ContentIssue = {
  line?: number
  message: string
}

export type SaveResult =
  { ok: true; post: Post } | { ok: false; issues: ContentIssue[] }

export type LoginState = {
  status: "idle" | "sent" | "error"
  message?: string
}

export type CommentStatus = "pending" | "approved" | "rejected"

export type BlogComment = {
  id: number
  postId: number
  parentId: number | null
  authorName: string
  body: string
  status: CommentStatus
  createdAt: string
  replies: BlogComment[]
}

export type AdminCommentRow = BlogComment & {
  postSlug: string
  postTitle: string
}

export type CommentSubmitState = {
  ok: boolean
  message: string
}

export type BoostState = {
  ok: boolean
  boosted: boolean
  message: string
}

export type Paged<T> = {
  items: T[]
  total: number
}
