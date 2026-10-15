import type { MetadataRoute } from "next"
import { listPublishedForSitemap } from "@/lib/blog/store"
import { SITE_URL } from "@/lib/site"

const lastModified = new Date()

async function publicReportUrls(): Promise<MetadataRoute.Sitemap> {
  // The public name reports are the programmatic SEO surface: one page
  // per real checked name, resolvable by search engines and people alike.
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8007"
    const res = await fetch(`${base}/api/v1/searches/public-top?limit=100`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = (await res.json()) as {
      items: { top_name: string; created_at: string }[]
    }
    const seen = new Set<string>()
    const urls: MetadataRoute.Sitemap = []
    for (const item of data.items) {
      if (!item.top_name || seen.has(item.top_name)) continue
      seen.add(item.top_name)
      urls.push({
        url: `${SITE_URL}/searches/${encodeURIComponent(item.top_name)}`,
        lastModified: new Date(item.created_at),
        changeFrequency: "monthly",
        priority: 0.5,
      })
    }
    return urls
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, reports] = await Promise.all([
    listPublishedForSitemap(),
    publicReportUrls(),
  ])

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/product`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/api/docs`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/api/docs/reference`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: posts[0] ? new Date(posts[0].updatedAt) : lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...reports,
  ]
}
