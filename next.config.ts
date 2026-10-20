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
  experimental: {
    // next dev on 16.2.x leaks on the render path: every App Router page
    // render retains heap plus a V8 context that is never released, so a
    // long-lived dev server climbs until it dies with a heap OOM. Radix's
    // barrel entry is the worst amplifier in this tree. Server Fast
    // Refresh is the other contributor; off, it restarts on server edits.
    optimizePackageImports: ["radix-ui"],
    turbopackServerFastRefresh: false,
  },
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
