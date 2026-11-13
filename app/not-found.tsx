import type { Metadata } from "next"
import AppFooter from "@/components/app-footer"
import AppHeader from "@/components/app-header"
import NotFoundContent from "@/components/not-found-content"

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: false },
}

/**
 * Unmatched URLs render here, under the root layout alone, so this one
 * brings its own header and footer. A notFound() thrown inside an area
 * with its own layout uses that area's not-found file instead.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppHeader />
      <main id="main-content" className="flex-1">
        <NotFoundContent />
      </main>
      <AppFooter />
    </div>
  )
}
