import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import BlogCard from "@/components/blog/blog-card"
import { BLOG_TITLE } from "@/lib/blog/config"
import { listPublishedPostsByTag, listPublishedTags } from "@/lib/blog/store"
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

  return pageMetadata({
    title: `${info.tag} — ${BLOG_TITLE}`,
    description: `${info.count} article${
      info.count === 1 ? "" : "s"
    } on ${info.tag} from the Unclaimed by AI blog: field notes on domains, social handles, and what AI models already believe about your name.`,
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
  const siblings = tags.filter((entry) => entry.slug !== slug)

  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-4 md:text-center">
          <p className="text-sm md:text-center">
            <Link href="/blog" className="text-muted-foreground">
              Blog
            </Link>
            <span className="text-muted-foreground"> / {info.tag}</span>
          </p>
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            {info.tag}
          </h1>
          <p className="max-w-prose text-muted-foreground md:mx-auto md:text-lg">
            {posts.length} article{posts.length === 1 ? "" : "s"} on this
            topic, newest first.
          </p>
          {siblings.length ? (
            <ul className="flex flex-wrap gap-1.5 md:justify-center">
              {siblings.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={`/blog/tag/${entry.slug}`}
                    className="inline-block border border-primary/30 px-1.5 py-0.5 text-[0.625rem] font-semibold tracking-widest text-primary uppercase transition-colors hover:bg-primary/10"
                  >
                    {entry.tag}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <ul className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </ul>
      </div>
    </section>
  )
}
