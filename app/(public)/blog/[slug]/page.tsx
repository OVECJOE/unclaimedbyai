import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { JsonLd } from "@/components/app/json-ld"
import PostArticle from "@/components/blog/post-article"
import { getPublishedPost, listPublishedSlugs } from "@/lib/blog/store"
import { SITE_URL, pageMetadata } from "@/lib/site"

export const revalidate = 3600

type PageProps = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await listPublishedSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPost(slug)
  if (!post || "redirectTo" in post) return {}

  return pageMetadata({
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    path: `/blog/${post.slug}`,
  })
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPublishedPost(slug)

  if (!post) notFound()
  if ("redirectTo" in post) permanentRedirect(`/blog/${post.redirectTo}`)

  const url = `${SITE_URL}/blog/${post.slug}`

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": `${url}#post`,
          mainEntityOfPage: url,
          headline: post.title,
          description: post.seoDescription ?? post.excerpt,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          image: post.coverImageUrl
            ? post.coverImageUrl.startsWith("http")
              ? post.coverImageUrl
              : `${SITE_URL}${post.coverImageUrl}`
            : undefined,
          keywords: post.tags.length ? post.tags.join(", ") : undefined,
          author: { "@type": "Person", name: post.author.name },
          publisher: { "@id": `${SITE_URL}/#organization` },
          inLanguage: "en",
        }}
      />
      <PostArticle post={post} />
    </>
  )
}
