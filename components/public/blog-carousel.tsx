import { listTopPublishedPosts } from "@/lib/blog/store"
import { isSafeCoverUrl } from "@/lib/blog/cover-image"
import BlogCarouselClient, { type CarouselPost } from "./blog-carousel-client"

/**
 * "Top three" means the posts readers boosted the most; a young blog
 * with no boosts yet simply shows its newest three (the store's
 * tie-break). Fails silent to nothing, like the other public bands.
 */
export default async function BlogCarousel() {
  let posts: Awaited<ReturnType<typeof listTopPublishedPosts>> = []
  try {
    posts = await listTopPublishedPosts(3)
  } catch {
    posts = []
  }
  if (!posts.length) return null

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
