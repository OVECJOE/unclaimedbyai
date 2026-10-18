import CopyCode from "@/components/public/copy-code"
import { SITE_URL } from "@/lib/site"

const BASE = `${SITE_URL}/api/v1`

/**
 * The three copy-paste paths that cover most of what people build.
 *
 * Kept server-rendered and static: these are the first thing an
 * integrator copies, so they must be in the HTML with no hydration.
 */
export default function ApiQuickstarts() {
  return (
    <div className="space-y-8">
      <div className="space-y-3 border p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center border font-mono text-xs font-semibold text-primary">
            1
          </span>
          <h3 className="font-heading text-xl font-semibold">
            Check one exact name
          </h3>
        </div>
        <CopyCode
          code={`curl -X POST ${BASE}/checks/direct \\
  -H "Authorization: Bearer uba_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Nexuare"}'

202 Accepted
{"search_id": 123, "name_id": 456}`}
        />
        <p className="text-sm text-muted-foreground">
          The first check on any name is free. Poll the results for scored
          names, and for names still running, whose job fills in with domains,
          handles, and per-model progress as it arrives.
        </p>
        <CopyCode
          code={`curl ${BASE}/searches/123/results \\
  -H "Authorization: Bearer uba_live_YOUR_KEY"`}
        />
      </div>

      <div className="space-y-3 border p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center border font-mono text-xs font-semibold text-primary">
            2
          </span>
          <h3 className="font-heading text-xl font-semibold">
            Generate names from a brief
          </h3>
        </div>
        <CopyCode
          code={`curl -X POST ${BASE}/searches/generate \\
  -H "Authorization: Bearer uba_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "an AI note-taking app for lawyers"}'

202 Accepted
{"id": 124, "generation": {"status": "generating"}}

curl ${BASE}/searches/124/header \\
  -H "Authorization: Bearer uba_live_YOUR_KEY"`}
        />
        <p className="text-sm text-muted-foreground">
          Sharpened briefs, four naming studios, a judge pass, and live .com
          screening. Accounts spend one search. Poll the header until generation
          reports ready.
        </p>
      </div>

      <div className="space-y-3 border p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center border font-mono text-xs font-semibold text-primary">
            3
          </span>
          <h3 className="font-heading text-xl font-semibold">
            Guard a name while you decide
          </h3>
        </div>
        <CopyCode
          code={`curl -X POST ${BASE}/watches \\
  -H "Authorization: Bearer uba_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"search_id": 123, "name": "Nexuare"}'

curl -X POST ${BASE}/watches/1/sweep \\
  -H "Authorization: Bearer uba_live_YOUR_KEY"`}
        />
        <p className="text-sm text-muted-foreground">
          Watches recheck domains and handles every few hours and are free.
          Sweep on demand when you are impatient.
        </p>
      </div>
    </div>
  )
}
