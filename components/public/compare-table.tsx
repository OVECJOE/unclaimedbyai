import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

type Cell = true | false | string

const COLUMNS = ["Unclaimed by AI", "Name generator", "Domain search", "Trademark search"]

const ROWS: { label: string; cells: [Cell, Cell, Cell, Cell] }[] = [
  { label: "Website address check (.com, .ai, .io, .co)", cells: [true, "sometimes", ".com only", false] },
  { label: "Social usernames on 5 platforms", cells: [true, false, false, false] },
  { label: "What AI chatbots already say about it", cells: [true, false, false, false] },
  { label: "Suggests names from your idea", cells: [true, true, false, false] },
  { label: "Research on your business idea", cells: [true, false, false, false] },
  { label: "Tells you if a name gets taken", cells: [true, false, false, false] },
  { label: "Shows where every answer came from", cells: [true, false, "partly", true] },
  { label: "Price to start", cells: ["Free", "Free", "Free", "$400+"] },
]

function Mark({ cell, featured }: { cell: Cell; featured: boolean }) {
  if (cell === true)
    return (
      <>
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          className={cn("mx-auto size-5", featured ? "text-primary" : "text-green-700 dark:text-green-500")}
          aria-hidden
        />
        <span className="sr-only">Yes</span>
      </>
    )
  if (cell === false)
    return (
      <>
        <HugeiconsIcon
          icon={Cancel01Icon}
          className="mx-auto size-4 text-muted-foreground/50"
          aria-hidden
        />
        <span className="sr-only">No</span>
      </>
    )
  return (
    <span className={cn("font-mono text-xs", featured ? "font-semibold text-primary" : "text-muted-foreground")}>
      {cell}
    </span>
  )
}

/**
 * The honest comparison: what a check here covers next to the tools
 * people already tab between. Scrolls sideways on a phone rather than
 * squeezing four columns into nothing.
 */
export default function CompareTable() {
  return (
    <div className="relative overflow-x-auto border">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <thead>
          <tr className="border-b">
            <th scope="col" className="w-[34%] p-4 text-start font-normal">
              <span className="sr-only">Capability</span>
            </th>
            {COLUMNS.map((column, index) => (
              <th
                key={column}
                scope="col"
                className={cn(
                  "p-4 text-center font-mono text-[0.6875rem] font-semibold tracking-[0.12em] uppercase",
                  index === 0
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-b last:border-b-0">
              <th scope="row" className="p-4 text-start font-medium">
                {row.label}
              </th>
              {row.cells.map((cell, index) => (
                <td
                  key={index}
                  className={cn(
                    "p-4 text-center",
                    index === 0 && "bg-primary/5"
                  )}
                >
                  <Mark cell={cell} featured={index === 0} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
