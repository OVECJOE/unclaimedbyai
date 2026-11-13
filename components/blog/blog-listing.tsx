import { notFound } from "next/navigation"
import { PaginationWindow } from "@/components/ui/pagination-window"
import { BLOG_SUBHEADING, BLOG_TITLE, POSTS_PER_PAGE } from "@/lib/blog/config"
import { listPublishedPostsPage, listPublishedTags } from "@/lib/blog/store"
import BlogCard from "./blog-card"
import EmptyBlogIllustration from "./empty-blog-illustration"
import TagScroller from "./tag-scroller"
import { SectionHeader } from "@/components/public/section-header"
import LetterField from "@/components/fields/letter-field"

export function blogPageHref(page: number): string {
  return page === 1 ? "/blog" : `/blog/page/${page}`
}

export default async function BlogListing({ page }: { page: number }) {
  const [{ items, total }, tags] = await Promise.all([
    listPublishedPostsPage(page, POSTS_PER_PAGE),
    listPublishedTags(),
  ])
  const pageCount = Math.max(1, Math.ceil(total / POSTS_PER_PAGE))

  if (page > pageCount) notFound()

  // The first page leads with the newest post; later pages are a plain
  // grid, since "newest" there would just be an arbitrary one.
  const lead = page === 1 ? items[0] : undefined
  const rest = lead ? items.slice(1) : items

  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="relative isolate -mx-4 overflow-hidden border-b px-4 pt-16 pb-12 md:pt-24">
          <LetterField quiet />
          <SectionHeader
            as="h1"
            eyebrow="The field guide"
            title={BLOG_TITLE}
            lede={BLOG_SUBHEADING}
          >
            {tags.length ? (
              <div data-field-avoid className="pt-2">
                <TagScroller tags={tags} />
              </div>
            ) : null}
          </SectionHeader>
        </div>

        {items.length ? (
          <>
            {lead ? (
              <ul aria-label="Latest post">
                <BlogCard post={lead} lead />
              </ul>
            ) : null}
            {rest.length ? (
              <div className="space-y-6">
                {lead ? (
                  <h2 className="border-t pt-6 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    More writing
                  </h2>
                ) : null}
                <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <BlogCard
                      key={post.id}
                      post={post}
                      headingLevel={lead ? "h3" : "h2"}
                    />
                  ))}
                </ul>
              </div>
            ) : null}
          </>
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
