import AppFooter from "@/components/app-footer"
import ClaimSearches from "@/components/dashboard/claim-searches"
import DashboardHeader from "@/components/dashboard/dashboard-header"
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
    <div>
      <DashboardHeader user={user} />
      <main className="min-h-screen">
        <ClaimSearches />
        {children}
      </main>
      <AppFooter />
    </div>
  )
}
