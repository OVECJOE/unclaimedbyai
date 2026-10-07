import AppFooter from "@/components/app-footer"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import { getMeServer } from "@/lib/api-server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getMeServer().catch(() => null)
  return (
    <div>
      <DashboardHeader user={user} />
      <main className="min-h-screen">{children}</main>
      <AppFooter />
    </div>
  )
}
