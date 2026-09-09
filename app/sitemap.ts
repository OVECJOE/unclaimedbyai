import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

const lastModified = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
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
  ]
}