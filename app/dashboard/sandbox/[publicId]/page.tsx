import { notFound } from "next/navigation"
import { apiServer } from "@/lib/api-server"
import { ApiError, type Sandbox } from "@/lib/api"
import SandboxView from "@/components/dashboard/sandbox-view"

export const dynamic = "force-dynamic"

export default async function SandboxPage({
  params,
}: {
  params: Promise<{ publicId: string }>
}) {
  const { publicId } = await params
  let sandbox: Sandbox
  try {
    sandbox = await apiServer<Sandbox>(`/api/v1/sandboxes/${publicId}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  }
  return <SandboxView sandbox={sandbox} />
}
