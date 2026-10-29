import type { Metadata } from "next"
import BlogListing from "@/components/blog/blog-listing"
import { BLOG_SUBHEADING, BLOG_TITLE } from "@/lib/blog/config"
import { JsonLd } from "@/components/app/json-ld"
import { pageMetadata, SITE_URL } from "@/lib/site"

export const revalidate = 3600

export const metadata: Metadata = pageMetadata({
  title: BLOG_TITLE,
  description: BLOG_SUBHEADING,
  path: "/blog",
})

export default function BlogIndexPage() {
  return (
    <>
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
              name: BLOG_TITLE,
              item: {
                "@type": "WebPage",
                name: BLOG_TITLE,
                url: `${SITE_URL}/blog`,
              },
            },
          ],
        }}
      />
      <BlogListing page={1} />
    </>
  )
}
