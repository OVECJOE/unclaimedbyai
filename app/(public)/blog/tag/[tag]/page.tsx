import type { Metadata } from "next"
import { notFound } from "next/navigation"
import BlogCard from "@/components/blog/blog-card"
import TagHero from "@/components/blog/tag-hero"
import { BLOG_TITLE } from "@/lib/blog/config"
import { listPublishedPostsByTag, listPublishedTags } from "@/lib/blog/store"
import { tagToDisplay } from "@/lib/blog/tags"
import { pageMetadata } from "@/lib/site"

export const revalidate = 3600

type PageProps = { params: Promise<{ tag: string }> }

export async function generateStaticParams() {
  const tags = await listPublishedTags()
  return tags.map((entry) => ({ tag: entry.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const slug = (await params).tag
  const info = (await listPublishedTags()).find(
    (entry) => entry.slug === slug
  )
  if (!info) return {}

  const display = tagToDisplay(info.tag)
  return pageMetadata({
    title: `${display} — ${BLOG_TITLE}`,
    description: `${info.count} post${
      info.count === 1 ? "" : "s"
    } on ${display.toLowerCase()} from the Unclaimed by AI blog: field notes on domains, social handles, and what AI models already believe about your name.`,
    path: `/blog/tag/${info.slug}`,
  })
}

export default async function BlogTagPage({ params }: PageProps) {
  const slug = (await params).tag
  const [posts, tags] = await Promise.all([
    listPublishedPostsByTag(slug),
    listPublishedTags(),
  ])

  if (!posts) notFound()

  const info = tags.find((entry) => entry.slug === slug)!

  return (
    <>
      <TagHero
        display={tagToDisplay(info.tag)}
        count={posts.length}
        latest={posts[0]?.publishedAt ?? null}
        tags={tags}
        currentSlug={slug}
      />

      <section className="px-4 py-10">
        <ul className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </ul>
      </section>
    </>
  )
}
