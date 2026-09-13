import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { NameResult } from "@/lib/constants"
import { summarizeResults } from "@/lib/name-results"

type GradingDistributionProps = {
  results: NameResult[]
}

const SEGMENTS = [
  { key: "Excellent", label: "Excellent", color: "bg-green-700" },
  { key: "Good", label: "Good", color: "bg-green-500" },
  { key: "Okay", label: "Okay", color: "bg-yellow-500" },
  { key: "Poor", label: "Poor", color: "bg-red-500" },
] as const

export default function GradingDistribution({ results }: GradingDistributionProps) {
  const { grading, total } = summarizeResults(results)

  return (
    <div className="space-y-4">
      <div
        role="img"
        aria-label="Score distribution"
        className="flex h-2 w-full border border-border"
      >
        {SEGMENTS.map(({ key, color }) => (
          <div
            key={key}
            className={`h-full ${color}`}
            style={{
              width: `${total ? (grading[key] / total) * 100 : 0}%`,
            }}
          />
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Score</TableHead>
            <TableHead className="text-end">Count</TableHead>
            <TableHead className="text-end">Share</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SEGMENTS.map(({ key, label, color }) => (
            <TableRow key={key}>
              <TableCell>
                <span className="flex items-center gap-2">
                  <span className={`size-2 ${color}`} />
                  <span className="font-medium">{label}</span>
                </span>
              </TableCell>
              <TableCell className="text-end tabular-nums text-muted-foreground">
                {grading[key]}
              </TableCell>
              <TableCell className="text-end tabular-nums text-muted-foreground">
                {total ? Math.round((grading[key] / total) * 100) : 0}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}