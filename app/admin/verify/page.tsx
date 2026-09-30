import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { verifyLoginToken } from "@/lib/blog/actions"

export default async function AdminVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  if (!token) redirect("/admin/login")

  return (
    <main className="mx-auto max-w-md space-y-6 px-4 py-24">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl font-semibold">Almost there</h1>
        <p className="text-muted-foreground">
          Confirm to finish signing in to the blog admin.
        </p>
      </div>
      <form action={verifyLoginToken}>
        <input type="hidden" name="token" value={token} />
        <Button type="submit">Continue</Button>
      </form>
    </main>
  )
}
