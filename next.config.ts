import type { NextConfig } from "next"

const CONFIGURED_API_ORIGIN = process.env.NEXT_PUBLIC_API_URL

if (!CONFIGURED_API_ORIGIN && process.env.NODE_ENV === "production") {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not set. Without it the rewrite target, server fetches, the sitemap, and llms.txt all point at localhost, and the app builds broken."
  )
}

const API_ORIGIN = CONFIGURED_API_ORIGIN ?? "http://127.0.0.1:8007"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  allowedDevOrigins: ["127.0.0.1"],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_ORIGIN}/api/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
