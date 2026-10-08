import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { listAllPosts, countPendingComments } from "@/lib/blog/store"
import { ADMIN_POSTS_PER_PAGE } from "@/lib/blog/config"
import { clampPage } from "@/lib/pagination"
import { PaginationWindow } from "@/components/ui/pagination-window"
import { formatDateTime } from "@/lib/utils"

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>
}) {
  const { page } = (await searchParams) ?? {}
  const requested = Number.parseInt(page ?? "", 10)
  const parsed = Number.isNaN(requested) ? 1 : requested

  let { items, total } = await listAllPosts(parsed, ADMIN_POSTS_PER_PAGE)
  const pendingCount = await countPendingComments()
  const pageCount = Math.max(1, Math.ceil(total / ADMIN_POSTS_PER_PAGE))
  const currentPage = clampPage(parsed, pageCount)
  if (currentPage !== parsed) {
    ;({ items, total } = await listAllPosts(currentPage, ADMIN_POSTS_PER_PAGE))
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-4xl font-semibold">Posts</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/blog/comments">
              Comments{pendingCount ? ` (${pendingCount})` : ""}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/blog/new">New post</Link>
          </Button>
        </div>
      </div>

      {items.length ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {post.title || "Untitled"}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        post.status === "published" ? "default" : "secondary"
                      }
                    >
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.authorName}</TableCell>
                  <TableCell>{formatDateTime(post.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationWindow
            currentPage={currentPage}
            pageCount={pageCount}
            basePath="/admin/blog"
          />
        </>
      ) : (
        <p className="text-muted-foreground">
          No posts yet. Create the first one.
        </p>
      )}
    </div>
  )
}
