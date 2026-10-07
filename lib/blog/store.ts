import "server-only"
import { createHash } from "node:crypto"
import { getSql } from "./db"
import type {
  AdminCommentRow,
  AdminPostRow,
  BlogComment,
  CommentStatus,
  Editor,
  Paged,
  Post,
  PostInput,
  PostRedirect,
  PostStatus,
  PostSummary,
} from "./types"

type PostRow = {
  id: number
  slug: string
  title: string
  excerpt: string
  cover_image_url: string | null
  cover_image_width: number | null
  cover_image_height: number | null
  body_mdx: string
  status: PostStatus
  published_at: Date | string | null
  updated_at: Date | string
  seo_title: string | null
  seo_description: string | null
  tags: string[]
  author_name: string
  author_avatar_url: string | null
}

type SummaryRow = Pick<
  PostRow,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "cover_image_url"
  | "cover_image_width"
  | "cover_image_height"
  | "published_at"
  | "updated_at"
  | "tags"
  | "author_name"
  | "author_avatar_url"
>

type EditorRow = {
  id: number
  email: string
  name: string
  avatar_url: string | null
}

const POST_SELECT = `
  select p.id::int as id, p.slug, p.title, p.excerpt, p.cover_image_url,
    p.cover_image_width::int as cover_image_width,
    p.cover_image_height::int as cover_image_height,
    p.body_mdx, p.status, p.published_at, p.updated_at, p.seo_title,
    p.seo_description, p.tags, e.name as author_name,
    e.avatar_url as author_avatar_url
  from blog_posts p
  join blog_editors e on e.id = p.author_id`

const SUMMARY_SELECT = `
  select p.id::int as id, p.slug, p.title, p.excerpt, p.cover_image_url,
    p.cover_image_width::int as cover_image_width,
    p.cover_image_height::int as cover_image_height,
    p.published_at, p.updated_at, p.tags, e.name as author_name,
    e.avatar_url as author_avatar_url
  from blog_posts p
  join blog_editors e on e.id = p.author_id`

function iso(value: Date | string): string {
  return new Date(value).toISOString()
}

function toPost(row: PostRow): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImageUrl: row.cover_image_url,
    coverImageWidth: row.cover_image_width,
    coverImageHeight: row.cover_image_height,
    bodyMdx: row.body_mdx,
    status: row.status,
    publishedAt: row.published_at ? iso(row.published_at) : null,
    updatedAt: iso(row.updated_at),
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    tags: row.tags,
    author: { name: row.author_name, avatarUrl: row.author_avatar_url },
  }
}

function toSummary(row: SummaryRow): PostSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImageUrl: row.cover_image_url,
    coverImageWidth: row.cover_image_width,
    coverImageHeight: row.cover_image_height,
    publishedAt: row.published_at ? iso(row.published_at) : null,
    updatedAt: iso(row.updated_at),
    author: { name: row.author_name, avatarUrl: row.author_avatar_url },
    tags: row.tags,
  }
}

function configured(): boolean {
  return Boolean(process.env.BLOG_DATABASE_URL)
}

function toEditor(row: EditorRow): Editor {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url,
  }
}

async function queryPosts(text: string, params: unknown[] = []) {
  return (await getSql().query(text, params)) as unknown as PostRow[]
}

export async function listPublishedPostsPage(
  page: number,
  pageSize: number
): Promise<Paged<PostSummary>> {
  if (!configured()) return { items: [], total: 0 }

  const sql = getSql()
  const [rows, counts] = await Promise.all([
    sql.query(
      `${SUMMARY_SELECT} where p.status = 'published'
       order by p.published_at desc, p.id desc limit $1 offset $2`,
      [pageSize, (page - 1) * pageSize]
    ) as unknown as Promise<SummaryRow[]>,
    sql`
      select count(*)::int as total from blog_posts where status = 'published'
    ` as unknown as Promise<{ total: number }[]>,
  ])

  return { items: rows.map(toSummary), total: counts[0]?.total ?? 0 }
}

export async function listPublishedForSitemap(): Promise<
  { slug: string; updatedAt: string }[]
> {
  if (!configured()) return []

  const sql = getSql()
  const rows = (await sql`
    select slug, updated_at from blog_posts
    where status = 'published' order by updated_at desc
  `) as { slug: string; updated_at: Date | string }[]

  return rows.map((row) => ({
    slug: row.slug,
    updatedAt: iso(row.updated_at),
  }))
}

export async function listPublishedSlugs(): Promise<string[]> {
  if (!configured()) return []
  const sql = getSql()
  const rows = (await sql`
    select slug from blog_posts where status = 'published'
  `) as { slug: string }[]
  return rows.map((row) => row.slug)
}

export async function getPublishedPost(
  slug: string
): Promise<Post | PostRedirect | null> {
  if (!configured()) return null
  const rows = await queryPosts(
    `${POST_SELECT} where p.slug = $1 and p.status = 'published'`,
    [slug]
  )
  if (rows[0]) return toPost(rows[0])

  const sql = getSql()
  const redirects = (await sql`
    select p.slug from blog_slug_redirects r
    join blog_posts p on p.id = r.post_id
    where r.old_slug = ${slug} and p.status = 'published'
  `) as { slug: string }[]

  return redirects[0] ? { redirectTo: redirects[0].slug } : null
}

export async function getPostById(id: number): Promise<Post | null> {
  const rows = await queryPosts(`${POST_SELECT} where p.id = $1`, [id])
  return rows[0] ? toPost(rows[0]) : null
}

export async function listAllPosts(
  page = 1,
  pageSize = 20
): Promise<Paged<AdminPostRow>> {
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1
  const safePageSize = Number.isFinite(pageSize)
    ? Math.min(Math.max(1, Math.floor(pageSize)), 100)
    : 20
  const sql = getSql()
  const [rows, counts] = await Promise.all([
    sql`
      select p.id::int as id, p.slug, p.title, p.status, p.updated_at,
        e.name as author_name
      from blog_posts p join blog_editors e on e.id = p.author_id
      order by p.updated_at desc, p.id desc
      limit ${safePageSize} offset ${(safePage - 1) * safePageSize}
    ` as unknown as Promise<
      {
        id: number
        slug: string
        title: string
        status: PostStatus
        updated_at: Date | string
        author_name: string
      }[]
    >,
    sql`select count(*)::int as total from blog_posts` as unknown as Promise<
      { total: number }[]
    >,
  ])

  return {
    items: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      status: row.status,
      updatedAt: iso(row.updated_at),
      authorName: row.author_name,
    })),
    total: counts[0]?.total ?? 0,
  }
}

export async function createPost(
  input: PostInput,
  editorId: number
): Promise<Post> {
  const sql = getSql()
  const [created] = (await sql`
    insert into blog_posts (
      slug, title, excerpt, cover_image_url, cover_image_width,
      cover_image_height, body_mdx, status, published_at,
      author_id, seo_title, seo_description, tags
    ) values (
      ${input.slug}, ${input.title}, ${input.excerpt}, ${input.coverImageUrl},
      ${input.coverImageWidth}, ${input.coverImageHeight},
      ${input.bodyMdx}, ${input.status},
      case when ${input.status} = 'published' then now() else null end,
      ${editorId}, ${input.seoTitle}, ${input.seoDescription},
      ${input.tags}::text[]
    ) returning id::int as id
  `) as { id: number }[]

  await sql`
    insert into blog_post_revisions (post_id, title, body_mdx, edited_by)
    values (${created.id}, ${input.title}, ${input.bodyMdx}, ${editorId})
  `

  return (await getPostById(created.id))!
}

export async function updatePost(
  id: number,
  input: PostInput,
  editorId: number
): Promise<{ post: Post; previousSlug: string } | null> {
  const previous = await getPostById(id)
  if (!previous) return null

  const sql = getSql()
  const contentChanged =
    previous.title !== input.title || previous.bodyMdx !== input.bodyMdx
  const slugChanged = previous.slug !== input.slug

  await sql.transaction([
    sql`delete from blog_slug_redirects where old_slug = ${input.slug}`,
    sql`
      update blog_posts set
        slug = ${input.slug},
        title = ${input.title},
        excerpt = ${input.excerpt},
        cover_image_url = ${input.coverImageUrl},
        cover_image_width = ${input.coverImageWidth},
        cover_image_height = ${input.coverImageHeight},
        body_mdx = ${input.bodyMdx},
        status = ${input.status},
        published_at = case
          when ${input.status} = 'published' then coalesce(published_at, now())
          else published_at
        end,
        seo_title = ${input.seoTitle},
        seo_description = ${input.seoDescription},
        tags = ${input.tags}::text[]
      where id = ${id}
    `,
    ...(slugChanged
      ? [
          sql`
            insert into blog_slug_redirects (old_slug, post_id)
            values (${previous.slug}, ${id})
            on conflict (old_slug) do update set post_id = excluded.post_id
          `,
        ]
      : []),
    ...(contentChanged
      ? [
          sql`
            insert into blog_post_revisions (post_id, title, body_mdx, edited_by)
            values (${id}, ${input.title}, ${input.bodyMdx}, ${editorId})
          `,
        ]
      : []),
  ])

  const post = await getPostById(id)
  return post ? { post, previousSlug: previous.slug } : null
}

export async function getEditorByEmail(email: string): Promise<Editor | null> {
  const sql = getSql()
  const rows = (await sql`
    select id::int as id, email, name, avatar_url
    from blog_editors where lower(email) = ${email.toLowerCase()}
  `) as EditorRow[]
  return rows[0] ? toEditor(rows[0]) : null
}

export async function getEditorById(id: number): Promise<Editor | null> {
  const sql = getSql()
  const rows = (await sql`
    select id::int as id, email, name, avatar_url
    from blog_editors where id = ${id}
  `) as EditorRow[]
  return rows[0] ? toEditor(rows[0]) : null
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

export async function storeLoginToken(
  editorId: number,
  tokenHash: string
): Promise<boolean> {
  const sql = getSql()
  const [recent] = (await sql`
    select count(*)::int as total from blog_login_tokens
    where editor_id = ${editorId} and created_at > now() - interval '15 minutes'
  `) as { total: number }[]

  if (recent.total >= 5) return false

  await sql`
    insert into blog_login_tokens (token_hash, editor_id, expires_at)
    values (${tokenHash}, ${editorId}, now() + interval '15 minutes')
  `
  return true
}

export async function consumeLoginToken(
  tokenHash: string
): Promise<Editor | null> {
  const sql = getSql()
  const rows = (await sql`
    update blog_login_tokens set used_at = now()
    where token_hash = ${tokenHash} and used_at is null and expires_at > now()
    returning editor_id::int as editor_id
  `) as { editor_id: number }[]

  return rows[0] ? getEditorById(rows[0].editor_id) : null
}

type CommentRow = {
  id: number
  post_id: number
  parent_id: number | null
  author_name: string
  body: string
  status: CommentStatus
  created_at: Date | string
}

function toComment(row: CommentRow): BlogComment {
  return {
    id: row.id,
    postId: row.post_id,
    parentId: row.parent_id,
    authorName: row.author_name,
    body: row.body,
    status: row.status,
    createdAt: iso(row.created_at),
    replies: [],
  }
}

export async function listApprovedComments(
  postId: number
): Promise<BlogComment[]> {
  if (!configured()) return []

  const sql = getSql()
  const rows = (await sql`
    select id::int as id, post_id::int as post_id, parent_id::int as parent_id,
      author_name, body, status, created_at
    from blog_comments
    where post_id = ${postId} and status = 'approved'
    order by created_at asc
  `) as CommentRow[]

  const byId = new Map<number, BlogComment>()
  const top: BlogComment[] = []
  for (const row of rows) byId.set(row.id, toComment(row))
  for (const comment of byId.values()) {
    const parent =
      comment.parentId === null ? undefined : byId.get(comment.parentId)
    if (parent) parent.replies.push(comment)
    else top.push(comment)
  }
  return top
}

export async function createComment(input: {
  postId: number
  parentId: number | null
  authorName: string
  body: string
}): Promise<{ id: number; postSlug: string } | null> {
  if (!configured()) return null

  const sql = getSql()
  const posts = (await sql`
    select slug from blog_posts where id = ${input.postId} and status = 'published'
  `) as { slug: string }[]
  if (!posts[0]) return null

  if (input.parentId !== null) {
    const parents = (await sql`
      select id from blog_comments
      where id = ${input.parentId} and post_id = ${input.postId}
        and parent_id is null and status = 'approved'
    `) as { id: number }[]
    if (!parents[0]) return null
  }

  const rows = (await sql`
    insert into blog_comments (post_id, parent_id, author_name, body)
    values (${input.postId}, ${input.parentId}, ${input.authorName}, ${input.body})
    returning id::int as id
  `) as { id: number }[]

  return rows[0] ? { id: rows[0].id, postSlug: posts[0].slug } : null
}

export async function listPendingComments(): Promise<AdminCommentRow[]> {
  if (!configured()) return []

  const sql = getSql()
  const rows = (await sql`
    select c.id::int as id, c.post_id::int as post_id,
      c.parent_id::int as parent_id, c.author_name, c.body, c.status,
      c.created_at, p.slug as post_slug, p.title as post_title
    from blog_comments c
    join blog_posts p on p.id = c.post_id
    where c.status = 'pending'
    order by c.created_at asc
  `) as (CommentRow & { post_slug: string; post_title: string })[]

  return rows.map((row) => ({
    ...toComment(row),
    postSlug: row.post_slug,
    postTitle: row.post_title,
  }))
}

export async function countPendingComments(): Promise<number> {
  if (!configured()) return 0

  const sql = getSql()
  const rows = (await sql`
    select count(*)::int as total from blog_comments where status = 'pending'
  `) as { total: number }[]
  return rows[0]?.total ?? 0
}

export async function moderateComment(
  id: number,
  status: Extract<CommentStatus, "approved" | "rejected">
): Promise<string | null> {
  if (!configured()) return null

  const sql = getSql()
  const rows = (await sql`
    update blog_comments set status = ${status} where id = ${id}
    returning post_id::int as post_id
  `) as { post_id: number }[]
  if (!rows[0]) return null

  const posts = (await sql`
    select slug from blog_posts where id = ${rows[0].post_id}
  `) as { slug: string }[]
  return posts[0]?.slug ?? null
}

export async function deleteComment(id: number): Promise<string | null> {
  if (!configured()) return null

  const sql = getSql()
  const rows = (await sql`
    delete from blog_comments where id = ${id}
    returning post_id::int as post_id
  `) as { post_id: number }[]
  if (!rows[0]) return null

  const posts = (await sql`
    select slug from blog_posts where id = ${rows[0].post_id}
  `) as { slug: string }[]
  return posts[0]?.slug ?? null
}

export async function listRecentApprovedComments(
  limit = 20
): Promise<AdminCommentRow[]> {
  if (!configured()) return []

  const safeLimit = Number.isFinite(limit)
    ? Math.min(Math.max(1, Math.floor(limit)), 100)
    : 20
  const sql = getSql()
  const rows = (await sql`
    select c.id::int as id, c.post_id::int as post_id,
      c.parent_id::int as parent_id, c.author_name, c.body, c.status,
      c.created_at, p.slug as post_slug, p.title as post_title
    from blog_comments c
    join blog_posts p on p.id = c.post_id
    where c.status = 'approved'
    order by c.created_at desc
    limit ${safeLimit}
  `) as (CommentRow & { post_slug: string; post_title: string })[]

  return rows.map((row) => ({
    ...toComment(row),
    postSlug: row.post_slug,
    postTitle: row.post_title,
  }))
}

export async function getPostBoostCount(postId: number): Promise<number> {
  if (!configured()) return 0

  const sql = getSql()
  const rows = (await sql`
    select count(*)::int as total from blog_signals
    where post_id = ${postId} and comment_id is null
  `) as { total: number }[]
  return rows[0]?.total ?? 0
}

export async function getCommentBoostCounts(
  postId: number
): Promise<Record<number, number>> {
  if (!configured()) return {}

  const sql = getSql()
  const rows = (await sql`
    select comment_id::int as comment_id, count(*)::int as total
    from blog_signals
    where post_id = ${postId} and comment_id is not null
    group by comment_id
  `) as { comment_id: number; total: number }[]

  const counts: Record<number, number> = {}
  for (const row of rows) counts[row.comment_id] = row.total
  return counts
}

export async function hasBoosted(
  postId: number,
  commentId: number | null,
  fingerprint: string | null
): Promise<boolean> {
  if (!configured() || !fingerprint) return false

  const sql = getSql()
  const rows =
    commentId === null
      ? ((await sql`
          select 1 as one from blog_signals
          where post_id = ${postId} and comment_id is null
            and fingerprint = ${fingerprint}
          limit 1
        `) as { one: number }[])
      : ((await sql`
          select 1 as one from blog_signals
          where comment_id = ${commentId} and fingerprint = ${fingerprint}
          limit 1
        `) as { one: number }[])
  return rows.length > 0
}

export async function addBoost(input: {
  postId: number
  commentId: number | null
  fingerprint: string
}): Promise<{ inserted: boolean; postSlug: string } | null> {
  if (!configured()) return null

  const sql = getSql()
  const posts = (await sql`
    select slug from blog_posts where id = ${input.postId} and status = 'published'
  `) as { slug: string }[]
  if (!posts[0]) return null

  if (input.commentId !== null) {
    const comments = (await sql`
      select id from blog_comments
      where id = ${input.commentId} and post_id = ${input.postId}
        and status = 'approved'
    `) as { id: number }[]
    if (!comments[0]) return null
  }

  const rows = (await sql`
    insert into blog_signals (post_id, comment_id, fingerprint)
    values (${input.postId}, ${input.commentId}, ${input.fingerprint})
    on conflict do nothing
    returning id::int as id
  `) as { id: number }[]

  return { inserted: rows.length > 0, postSlug: posts[0].slug }
}

export async function listMyBoostedCommentIds(
  postId: number,
  fingerprint: string | null
): Promise<number[]> {
  if (!configured() || !fingerprint) return []

  const sql = getSql()
  const rows = (await sql`
    select comment_id::int as comment_id from blog_signals
    where post_id = ${postId} and comment_id is not null
      and fingerprint = ${fingerprint}
  `) as { comment_id: number }[]
  return rows.map((row) => row.comment_id)
}
