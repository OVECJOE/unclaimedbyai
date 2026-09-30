import AdminHeader from "@/components/admin/admin-header"
import { requireEditor } from "@/lib/blog/session"

export default async function AdminBlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const editor = await requireEditor()

  return (
    <>
      <AdminHeader editor={editor} />
      <main className="mx-auto max-w-7xl px-4 py-10">{children}</main>
    </>
  )
}
