import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import { JsonLd } from "@/components/app/json-ld"
import PostArticle from "@/components/blog/post-article"
import PostBoost from "@/components/blog/post-boost"
import BoostStateProvider from "@/components/blog/boost-state"
import CommentSection from "@/components/blog/comment-section"
import PrompterCta from "@/components/public/prompter-cta"
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

  const metadata = pageMetadata({
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    path: `/blog/${post.slug}`,
  })

  if (post.coverImageUrl) {
    const imageUrl = post.coverImageUrl.startsWith("http")
      ? post.coverImageUrl
      : `${SITE_URL}${post.coverImageUrl}`
    const image =
      post.coverImageWidth && post.coverImageHeight
        ? {
            url: imageUrl,
            width: post.coverImageWidth,
            height: post.coverImageHeight,
          }
        : { url: imageUrl }
    metadata.openGraph = { ...metadata.openGraph, images: [image] }
    metadata.twitter = { ...metadata.twitter, images: [imageUrl] }
  }

  return metadata
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
          author: {
            "@type": "Person",
            name: post.author.name,
            ...(post.author.socials.length
              ? { sameAs: post.author.socials.map((social) => social.url) }
              : {}),
          },
          publisher: { "@id": `${SITE_URL}/#organization` },
          inLanguage: "en",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: { "@type": "WebPage", name: "Home", url: SITE_URL },
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Blog",
              item: {
                "@type": "WebPage",
                name: "Blog",
                url: `${SITE_URL}/blog`,
              },
            },
            {
              "@type": "ListItem",
              position: 3,
              name: post.title,
              item: { "@type": "WebPage", name: post.title, url },
            },
          ],
        }}
      />
      <PostArticle post={post} />
      <BoostStateProvider postId={post.id}>
        <PostBoost postId={post.id} />
        <CommentSection postId={post.id} />
      </BoostStateProvider>
      {/* Every article ends in the product: reading about naming should
          end with a name being named, not with another article. */}
      <section className="mt-10 border-t px-4 py-10">
        <div className="mx-auto max-w-prose space-y-4 text-center">
          <p className="text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
            Your turn
          </p>
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
            {post.tags.length
              ? `From ${post.tags[0]} theory to your own shortlist.`
              : "From reading to naming."}
          </h2>
          <p className="text-sm text-muted-foreground">
            One brief runs four naming studios, and every survivor is screened
            live against .com registration, real handles, and AI associations
            before it reaches you.
          </p>
          <PrompterCta />
        </div>
      </section>
    </>
  )
}
