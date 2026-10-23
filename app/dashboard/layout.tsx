import AppFooter from "@/components/app-footer"
import ClaimSearches from "@/components/dashboard/claim-searches"
import DashboardSidebar from "@/components/dashboard/sidebar"
import MobileHeader from "@/components/dashboard/mobile-header"
import MobileNav from "@/components/dashboard/mobile-nav"
import DashboardTour from "@/components/dashboard/tour"
import { getMeServer } from "@/lib/api-server"
import { ApiError } from "@/lib/api"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getMeServer().catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  })
  if (!user) redirect("/auth")
  return (
    <div className="min-h-screen">
      <DashboardSidebar user={user} />
      {/* The phone shell is a fixed bottom bar, so the content carries
          the bar's height as bottom padding rather than scrolling under
          it. Desktop clears the rail on the left instead.
          Main is a flex column and the content wrapper grows, so on a
          short page the leftover height lands above the footer, not
          below it, and the footer stays pinned to the bottom. */}
      <a
        href="#main-content"
        className="sr-only z-100 bg-primary px-4 py-3 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <main
        id="main-content"
        className="flex min-h-screen flex-col pb-[calc(4rem_+_env(safe-area-inset-bottom))] md:pb-0 md:pl-60"
      >
        <MobileHeader user={user} />
        <ClaimSearches />
        {/* Renders nothing; drives the spotlight tour while active. */}
        <DashboardTour />
        <div className="flex-1">{children}</div>
        <AppFooter />
      </main>
      <MobileNav />
    </div>
  )
}
