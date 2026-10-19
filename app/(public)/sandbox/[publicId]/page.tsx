import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { apiServer, getMeServer, isLoggedOut } from "@/lib/api-server"
import { ApiError, type SandboxDetail } from "@/lib/api"
import SandboxView from "@/components/dashboard/sandbox-view"
import SandboxGate from "@/components/dashboard/sandbox-gate"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Your sandbox",
  robots: { index: false, follow: false },
}

export default async function SandboxPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>
  searchParams: Promise<{ sid?: string }>
}) {
  const { publicId } = await params
  const { sid } = await searchParams
  const user = await getMeServer().catch(() => null)
  const query = sid ? `?sid=${encodeURIComponent(sid)}` : ""
  let sandbox: SandboxDetail
  try {
    sandbox = await apiServer<SandboxDetail>(
      `/api/v1/sandboxes/${publicId}${query}`
    )
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    if (isLoggedOut(error)) {
      return (
        <section className="px-4 py-16">
          <div className="mx-auto max-w-prose space-y-4 border border-dashed p-10 text-center">
            <h1 className="font-heading text-3xl font-semibold">
              This sandbox needs its session token
            </h1>
            <p className="text-sm text-muted-foreground">
              The link is missing the access token that keeps your ideas
              private, or it was opened in a different browser. Open the
              original link where you started the sandbox — or sign in and pick
              up where you left off.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/auth">Sign in</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Start your own sandbox</Link>
              </Button>
            </div>
          </div>
        </section>
      )
    }
    throw error
  }
  return (
    <>
      {!user ? <SandboxGate next={`/sandbox/${publicId}`} /> : null}
      <SandboxView sandbox={sandbox} sid={sid} />
    </>
  )
}
