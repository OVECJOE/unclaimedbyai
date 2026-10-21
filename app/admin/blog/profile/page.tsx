import SocialsForm from "@/components/admin/socials-form"
import { requireEditor } from "@/lib/blog/session"

export default async function ProfilePage() {
  const editor = await requireEditor()

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-heading text-3xl font-semibold">Profile</h1>
        <p className="text-muted-foreground">
          The links below appear as icons next to your name on every post you
          have written, and feed the author structured data on those posts.
          Leave a field empty to hide that platform.
        </p>
      </div>
      <SocialsForm editor={editor} />
    </div>
  )
}
