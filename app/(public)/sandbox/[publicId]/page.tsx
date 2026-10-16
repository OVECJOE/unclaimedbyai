import { notFound } from "next/navigation"
import { apiServer, getMeServer } from "@/lib/api-server"
import { ApiError, type Sandbox } from "@/lib/api"
import SandboxView from "@/components/dashboard/sandbox-view"
import SandboxGate from "@/components/dashboard/sandbox-gate"

export const dynamic = "force-dynamic"

/**
 * One sandbox, reachable two ways: a signed-in owner, or the anonymous
 * session that ran the taste run, addressed by sid the way the check page
 * already addresses its live phase. The gate below is the sign-in ask,
 * which sits in front of the ideas rather than replacing them, so the
 * visitor sees what their taste run produced before being asked for an
 * account.
 */
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
  let sandbox: Sandbox
  try {
    sandbox = await apiServer<Sandbox>(`/api/v1/sandboxes/${publicId}${query}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }
  return (
    <>
      {!user ? <SandboxGate /> : null}
      <SandboxView sandbox={sandbox} sid={sid} />
    </>
  )
}
