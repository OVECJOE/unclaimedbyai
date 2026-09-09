import { Separator } from "@/components/ui/separator"
import { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface TextDividerProps extends HTMLAttributes<HTMLDivElement> {
  label?: string
}

export function TextDivider({ label = "OR", className, ...props }: TextDividerProps) {
  return (
    <div className={cn("my-5 flex items-center gap-3", className)} {...props}>
      <Separator className="flex-1" />
      <span className="text-xs font-medium tracking-wide text-muted-foreground">
        {label}
      </span>
      <Separator className="flex-1" />
    </div>
  )
}
