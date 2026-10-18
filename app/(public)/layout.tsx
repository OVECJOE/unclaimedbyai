import AppHeader from "@/components/app-header"
import AppFooter from "@/components/app-footer"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // The wrapper is a flex column so main grows into the leftover
    // height and the footer stays pinned to the bottom of the viewport
    // even on pages too short to fill it.
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">{children}</main>
      <AppFooter />
    </div>
  )
}
