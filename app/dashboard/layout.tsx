import DashboardHeader from "@/components/dashboard/dashboard-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="max-h-screen overflow-y-auto scrollbar-none">
      <DashboardHeader />
      <main className="min-h-[50svh]">{children}</main>
    </div>
  )
}
