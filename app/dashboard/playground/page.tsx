import DashboardPageHeader from "@/components/dashboard/page-header"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import PlaygroundCanvas from "@/components/playground/canvas"
import { ApiError, type SandboxDetail, type SandboxList } from "@/lib/api"
import { apiServer } from "@/lib/api-server"

export const dynamic = "force-dynamic"

async function loadSandboxes(): Promise<SandboxList> {
  try {
    return await apiServer<SandboxList>("/api/v1/sandboxes?page_size=50")
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/auth")
    throw error
  }
}

function loadDetail(publicId: string): Promise<SandboxDetail> {
  return apiServer<SandboxDetail>(`/api/v1/sandboxes/${publicId}`)
}

/**
 * The canvas: one sandbox at a time, addressed by ?sandbox= so a
 * reload lands on the same board and a link shares it. The sandbox
 * list and the open detail are fetched together, never in sequence,
 * and passed down so the client never refetches what the server
 * already knows.
 */
export default async function PlaygroundPage({
  searchParams,
}: {
  searchParams: Promise<{ sandbox?: string }>
}) {
  const { sandbox: selected } = await searchParams
  const list = await loadSandboxes()

  // No sandbox picked: open the most recent one, or the first-run
  // empty state when the account has none yet.
  const fallback = list.items[0]?.public_id
  const activeId = selected ?? fallback

  let detail: SandboxDetail | null = null
  if (activeId) {
    detail = await loadDetail(activeId).catch(() => null)
  }

  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardPageHeader
          title="Playground"
          description="A sandbox holds the ideas for one business. Open an idea to research it, or turn it into names to check."
          actions={
            <Button variant="outline" asChild>
              <Link href="/dashboard/playground/sandboxes">All sandboxes</Link>
            </Button>
          }
        />
        <PlaygroundCanvas
          initialList={list}
          initialDetail={detail}
          activeId={activeId ?? null}
        />
      </div>
    </section>
  )
}
