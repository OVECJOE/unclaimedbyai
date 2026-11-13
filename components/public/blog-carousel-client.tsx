import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { SectionHeader } from "@/components/public/section-header"

export type CarouselPost = {
  slug: string
  title: string
  excerpt: string
  boosts: number
  tags: string[]
  cover: string | null
  dateLabel: string
}

function topic(tags: string[]): string | null {
  const tag = tags[0]
  if (!tag) return null
  const words = tag.replace(/[-_]+/g, " ").trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

function PostCard({ post }: { post: CarouselPost }) {
  const label = [topic(post.tags), post.dateLabel].filter(Boolean).join(" · ")
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col border bg-card transition-colors hover:border-primary/50"
    >
      <div className="relative aspect-[16/9] overflow-hidden border-b bg-sidebar">
        {post.cover ? (
          <Image
            src={post.cover}
            alt=""
            fill
            sizes="(max-width: 768px) 85vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <p className="flex h-full items-center p-6 font-heading text-2xl leading-snug">
            {post.title}
          </p>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {label ? (
          <p className="text-xs text-muted-foreground">{label}</p>
        ) : null}
        <h3 className="mt-2 font-heading text-2xl leading-tight transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
          <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
            Read the post
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </span>
          {post.boosts > 0 ? (
            <span className="text-xs text-muted-foreground">
              {post.boosts} {post.boosts === 1 ? "boost" : "boosts"}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

/**
 * Up to three posts about naming. A plain grid on wider screens, where
 * all three fit, and a native swipe row on phones, where the next card
 * peeking in says there is more. No carousel arrows to sit on top of
 * the covers.
 */
export default function BlogCarouselClient({
  posts,
}: {
  posts: CarouselPost[]
}) {
  return (
    <section className="border-b px-4 py-20 md:py-24">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader
            align="start"
            eyebrow="The field guide"
            title="Naming, written"
            accent="down properly."
            lede="Short reads on choosing a name and checking it before you commit."
          />
          <Link
            href="/blog"
            className="text-sm text-primary underline underline-offset-4"
          >
            All posts
          </Link>
        </div>

        <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {posts.map((post) => (
            <li
              key={post.slug}
              className="w-[85%] shrink-0 snap-start md:w-auto"
            >
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
