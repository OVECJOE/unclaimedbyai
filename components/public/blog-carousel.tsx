import { listTopPublishedPosts } from "@/lib/blog/store"
import { isSafeCoverUrl } from "@/lib/blog/cover-image"
import { tagToSlug } from "@/lib/blog/tags"
import BlogCarouselClient, { type CarouselPost } from "./blog-carousel-client"

// The landing speaks to people naming a business, so it only features
// posts about naming. Engineering write-ups stay on /blog.
const NAMING_TAGS = new Set([
  "naming",
  "naming-is-hard",
  "domains",
  "brand-names",
  "ai-collision",
])

/**
 * The three most-boosted posts about naming (a young blog with no
 * boosts yet shows its newest, the store's tie-break). Shows nothing
 * when fewer than two qualify, and fails silent like the other bands.
 */
export default async function BlogCarousel() {
  let posts: Awaited<ReturnType<typeof listTopPublishedPosts>> = []
  try {
    posts = (await listTopPublishedPosts(30))
      .filter((post) => post.tags.some((tag) => NAMING_TAGS.has(tagToSlug(tag))))
      .slice(0, 3)
  } catch {
    posts = []
  }
  if (posts.length < 2) return null

  const cards: CarouselPost[] = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    boosts: post.boosts,
    tags: post.tags.slice(0, 3),
    cover: isSafeCoverUrl(post.coverImageUrl) ? post.coverImageUrl : null,
    dateLabel: post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "",
  }))

  return <BlogCarouselClient posts={cards} />
}
