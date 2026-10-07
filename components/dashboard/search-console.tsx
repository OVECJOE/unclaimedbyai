"use client"

import Prompter from "@/components/app/prompter"
import CandidateList from "./candidate-list"
import CheckReport from "./check-report"
import { useSearchConsole } from "./use-search-console"
import type { ApiUser } from "@/lib/api"

export default function SearchConsole({ user }: { user: ApiUser }) {
  const { state, generate, check } = useSearchConsole(user.searches_left)

  return (
    <div className="mx-auto max-w-prose space-y-6">
      <Prompter
        onSubmit={(value) => void generate(value)}
        pending={state.phase === "generating"}
      />
      <p className="-mt-3 text-center text-xs text-muted-foreground">
        {state.phase === "generating"
          ? "Generating names…"
          : `${state.searchesLeft ?? user.searches_left} searches left`}
      </p>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      {state.searchId !== null ? (
        <CandidateList
          candidates={state.candidates}
          checkingName={state.checkingName}
          onCheck={(name) => void check(name)}
        />
      ) : null}

      {state.phase === "checking" && state.checkingName ? (
        <p className="text-sm text-muted-foreground">
          Checking {state.checkingName} across domains, handles, and AI models.
          This can take up to a minute…
        </p>
      ) : null}

      {state.report ? <CheckReport report={state.report} /> : null}
    </div>
  )
}
