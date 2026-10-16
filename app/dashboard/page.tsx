import { Button } from "@/components/ui/button"
import Link from "next/link"
import { apiServer } from "@/lib/api-server"
import type { Sandbox } from "@/lib/api"
import NewSandboxButton from "@/components/dashboard/new-sandbox-button"

export const dynamic = "force-dynamic"

function signalSummary(sandbox: Sandbox): string | null {
  const parts = [
    sandbox.signals.skills,
    sandbox.signals.time_available,
    sandbox.signals.business_model,
  ].filter(Boolean) as string[]
  return parts.length ? parts.join(" · ") : null
}

export default async function PlaygroundPage() {
  const sandboxes = await apiServer<Sandbox[]>("/api/v1/sandboxes").catch(
    () => [] as Sandbox[]
  )

  return (
    <section className="px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-4xl font-semibold">Playground</h1>
          <p className="max-w-prose text-muted-foreground">
            A sandbox holds ideas. Generate a batch, research the ones that
            catch you, then turn one into names. Each sandbox carries its own
            steer, so a weekend idea and a serious one can differ.
          </p>
        </div>

        <NewSandboxButton />

        {sandboxes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No sandboxes yet. Start one, answer three questions, and generate
            your first batch of ideas.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sandboxes.map((sandbox) => {
              const summary = signalSummary(sandbox)
              return (
                <li key={sandbox.public_id}>
                  <Link
                    href={`/dashboard/sandbox/${sandbox.public_id}`}
                    className="block border p-5 transition-colors hover:border-primary/50"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-heading text-xl font-semibold">
                        {sandbox.name}
                      </p>
                      {sandbox.auto_created ? (
                        <span className="text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
                          Started from a search
                        </span>
                      ) : null}
                    </div>
                    {summary ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {summary}
                      </p>
                    ) : null}
                    <p className="mt-3 text-sm text-muted-foreground">
                      {sandbox.idea_count} idea
                      {sandbox.idea_count === 1 ? "" : "s"}
                      {sandbox.search_count > 0
                        ? ` · ${sandbox.search_count} search${
                            sandbox.search_count === 1 ? "" : "es"
                          }`
                        : ""}
                    </p>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        <div className="border p-5">
          <p className="text-sm text-muted-foreground">
            Already have an idea in mind? Skip generation and go straight to
            names.{" "}
            <Link href="/#check-yours" className="text-primary underline">
              Check it on the home page
            </Link>
            , or add it by hand inside a sandbox.
          </p>
          <Button variant="outline" size="sm" asChild className="mt-3">
            <Link href="/dashboard/billing">See plan and credits</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
