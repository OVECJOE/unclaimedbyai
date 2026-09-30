import Link from "next/link"
import { notFound } from "next/navigation"
import { PaginationWindow } from "@/components/ui/pagination-window"
import { BLOG_SUBHEADING, BLOG_TITLE, POSTS_PER_PAGE } from "@/lib/blog/config"
import { listPublishedPostsPage } from "@/lib/blog/store"

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" })

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
        <div className="space-y-3 text-center">
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            {BLOG_TITLE}
          </h1>
          <p className="mx-auto max-w-prose md:text-lg">{BLOG_SUBHEADING}</p>
        </div>

        {items.length ? (
          <ul className="divide-y border">
            {items.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block space-y-2 p-5 hover:bg-muted"
                >
                  <h2 className="font-heading text-2xl">{post.title}</h2>
                  {post.excerpt ? (
                    <p className="text-muted-foreground">{post.excerpt}</p>
                  ) : null}
                  <p className="text-sm text-muted-foreground">
                    {post.author.name}
                    {post.publishedAt ? (
                      <>
                        {" · "}
                        <time dateTime={post.publishedAt}>
                          {dateFormat.format(new Date(post.publishedAt))}
                        </time>
                      </>
                    ) : null}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 360 220"
              width="720"
              height="440"
              style={{ fontFamily: "var(--font-mono)" }}
              className="mx-auto h-auto w-full max-w-[720px]"
            >
              <rect width="360" height="220" fill="var(--background)" />
              <g
                fill="none"
                stroke="var(--foreground)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 180H346" />
                <g stroke="var(--muted-foreground)" strokeWidth="1.5">
                  <path d="M44 193h14M96 197h22M232 194h18M318 198h12" />
                </g>
                <g>
                  <g transform="translate(36 164)">
                    <circle r="16" />
                    <path d="M-12 0Q0 -12 12 0M-10 8Q0 -4 10 10M0 -16Q12 -2 0 16" />
                  </g>
                  <g stroke="var(--muted-foreground)" strokeWidth="1.5">
                    <path d="M6 156h10M2 165h14" />
                  </g>
                </g>
                <path d="M110 180V56" strokeWidth="6" />
                <path d="M62 50H146L162 68L146 86H62Z" fill="var(--muted)" />
                <g transform="rotate(-7 110 116)">
                  <path d="M72 104H150V128H72Z" fill="var(--muted)" />
                  <circle cx="78" cy="110" r="1.6" fill="var(--foreground)" />
                </g>
                <path d="M186 96H262V180H186Z" fill="var(--background)" />
                <path d="M244 96L262 114H244Z" fill="var(--muted)" />
                <path d="M208 156Q224 144 240 156" />
                <path
                  d="M300 180V124"
                  stroke="var(--primary)"
                  strokeWidth="10"
                />
                <path
                  d="M300 162H284V146M300 152H316V138"
                  stroke="var(--primary)"
                  strokeWidth="8"
                />
                <g fill="var(--foreground)" stroke="none">
                  <circle cx="209" cy="132" r="3" />
                  <circle cx="239" cy="132" r="3" />
                  <rect x="291" y="132" width="8" height="6" />
                  <rect x="302" y="132" width="8" height="6" />
                </g>
                <path d="M299 135h3" strokeWidth="1.5" />
                <path
                  d="M239 139q-4 6 0 9q4 -3 0 -9Z"
                  fill="var(--primary)"
                  stroke="none"
                />
                <path
                  d="M236 108V118"
                  stroke="var(--primary)"
                  strokeWidth="2"
                />
              </g>
              <g fill="var(--foreground)" fontSize="11" letterSpacing="1">
                <text x="70" y="72">
                  NEW POSTS
                </text>
                <text
                  x="80"
                  y="120"
                  transform="rotate(-7 110 116)"
                  fontSize="10"
                >
                  SOON(ISH)
                </text>
                <text
                  x="192"
                  y="113"
                  fontSize="9"
                  fill="var(--muted-foreground)"
                  letterSpacing="0"
                >
                  Untitled
                </text>
              </g>
            </svg>
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
