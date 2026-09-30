import { redirect } from "next/navigation"
import LoginForm from "@/components/admin/login-form"
import { getCurrentEditor } from "@/lib/blog/session"

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  if (await getCurrentEditor()) redirect("/admin/blog")

  const { error } = await searchParams

  return (
    <main className="mx-auto max-w-md space-y-6 px-4 py-24">
      <div className="space-y-2">
        <h1 className="font-heading text-4xl font-semibold">Blog admin</h1>
        <p className="text-muted-foreground">
          Enter your editor email and we will send you a sign-in link.
        </p>
        {error === "link" ? (
          <p className="text-sm text-destructive">
            That sign-in link has expired or was already used. Request a new
            one.
          </p>
        ) : null}
      </div>
      <LoginForm />
    </main>
  )
}
