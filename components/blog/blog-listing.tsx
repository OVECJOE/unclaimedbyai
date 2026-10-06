import { notFound } from "next/navigation"
import { PaginationWindow } from "@/components/ui/pagination-window"
import { BLOG_SUBHEADING, BLOG_TITLE, POSTS_PER_PAGE } from "@/lib/blog/config"
import { listPublishedPostsPage } from "@/lib/blog/store"
import BlogCard from "./blog-card"
import EmptyBlogIllustration from "./empty-blog-illustration"

export function blogPageHref(page: number): string {
  return page === 1 ? "/blog" : `/blog/page/${page}`
}

export default async function BlogListing({ page }: { page: number }) {
  const { items, total } = await listPublishedPostsPage(page, POSTS_PER_PAGE)
  const pageCount = Math.max(1, Math.ceil(total / POSTS_PER_PAGE))

  if (page > pageCount) notFound()

  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-3 md:text-center">
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            {BLOG_TITLE}
          </h1>
          <p className="max-w-prose md:mx-auto md:text-lg">{BLOG_SUBHEADING}</p>
        </div>

        {items.length ? (
          <ul className="grid gap-6 sm:grid-cols-2">
            {items.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </ul>
        ) : (
          <div className="mt-8">
            <EmptyBlogIllustration />
          </div>
        )}

        <PaginationWindow
          currentPage={page}
          pageCount={pageCount}
          getHref={blogPageHref}
        />
      </div>
    </section>
  )
}
