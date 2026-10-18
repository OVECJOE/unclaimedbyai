import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/api/docs", "/api/docs.md", "/api/blog/images/"],
      disallow: [
        "/auth",
        "/dashboard",
        "/admin",
        "/api/v1",
        "/api/admin",
        "/api/blog/boost-state",
        "/api/blog/company-meta",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
