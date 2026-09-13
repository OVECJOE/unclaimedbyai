import DashboardHeader from "@/components/dashboard/dashboard-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <DashboardHeader />
      <main className="min-h-screen">{children}</main>
    </div>
  )
}
