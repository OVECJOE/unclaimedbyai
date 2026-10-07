import { Button } from "@/components/ui/button"
import type { NameCandidate } from "@/lib/api"

export default function CandidateList({
  candidates,
  checkingName,
  onCheck,
}: {
  candidates: NameCandidate[]
  checkingName: string | null
  onCheck: (name: string) => void
}) {
  if (!candidates.length) return null

  return (
    <div className="space-y-2">
      <h3 className="font-heading text-xl">Candidates</h3>
      <ul className="divide-y divide-border border-y">
        {candidates.map((candidate) => {
          const checkingThis = checkingName === candidate.name
          return (
            <li
              key={candidate.name}
              className="flex flex-wrap items-center justify-between gap-2 py-2"
            >
              <div>
                <p className="font-medium">{candidate.name}</p>
                {candidate.rationale ? (
                  <p className="text-sm text-muted-foreground">
                    {candidate.rationale}
                  </p>
                ) : null}
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={checkingName !== null}
                onClick={() => onCheck(candidate.name)}
              >
                {checkingThis ? "Checking…" : "Check"}
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
