import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * The shared top of a dashboard page: the title, one plain sentence on
 * what the page is for, and the page's own actions on the right.
 */
export default function DashboardPageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-2">
        <h1 className="font-heading text-4xl font-semibold md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-prose text-sm text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2">
          {actions}
        </div>
      ) : null}
    </header>
  )
}
