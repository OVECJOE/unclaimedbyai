import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"
import BlogListing from "@/components/blog/blog-listing"
import { BLOG_SUBHEADING, BLOG_TITLE, POSTS_PER_PAGE } from "@/lib/blog/config"
import { listPublishedPostsPage } from "@/lib/blog/store"
import { pageMetadata } from "@/lib/site"

export const revalidate = 3600

type PageProps = { params: Promise<{ page: string }> }

function parsePage(value: string): number | null {
  return /^[1-9]\d*$/.test(value) ? Number(value) : null
}

export async function generateStaticParams() {
  const { total } = await listPublishedPostsPage(1, POSTS_PER_PAGE)
  const pageCount = Math.ceil(total / POSTS_PER_PAGE)

  return Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) => ({
    page: String(index + 2),
  }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const page = parsePage((await params).page)
  if (!page || page === 1) return {}

  return pageMetadata({
    title: `${BLOG_TITLE} (page ${page})`,
    description: BLOG_SUBHEADING,
    path: `/blog/page/${page}`,
  })
}

export default async function BlogPageNumber({ params }: PageProps) {
  const page = parsePage((await params).page)

  if (!page) notFound()
  if (page === 1) permanentRedirect("/blog")

  return <BlogListing page={page} />
}
