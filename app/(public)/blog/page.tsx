import type { Metadata } from "next"
import BlogListing from "@/components/blog/blog-listing"
import { BLOG_SUBHEADING, BLOG_TITLE } from "@/lib/blog/config"
import { pageMetadata } from "@/lib/site"

export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  title: BLOG_TITLE,
  description: BLOG_SUBHEADING,
  path: "/blog",
})

export default function BlogIndexPage() {
  return <BlogListing page={1} />
}
