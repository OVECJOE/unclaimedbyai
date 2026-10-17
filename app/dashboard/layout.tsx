import AppFooter from "@/components/app-footer"
import ClaimSearches from "@/components/dashboard/claim-searches"
import DashboardSidebar from "@/components/dashboard/sidebar"
import MobileNav from "@/components/dashboard/mobile-nav"
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
          it. Desktop clears the rail on the left instead. */}
      <main className="min-h-screen pb-16 md:pb-0 md:pl-60">
        <ClaimSearches />
        {children}
        <AppFooter />
      </main>
      <MobileNav />
    </div>
  )
}
