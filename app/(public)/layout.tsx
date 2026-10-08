import AppHeader from "@/components/app-header"
import AppFooter from "@/components/app-footer"
import { WaitlistDialog } from "@/components/waitlist-dialog"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <AppHeader />
      <main className="min-h-screen">{children}</main>
      <AppFooter />
      <WaitlistDialog />
    </div>
  )
}
