import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PreviewCardProps extends React.ComponentProps<typeof Card> {
  children: React.ReactNode
}

export function PreviewCard({ children, className, ...props }: PreviewCardProps) {
  return (
    <Card className={cn("w-full max-w-xs overflow-hidden py-0", className)} {...props}>
      <div className="flex items-center gap-1.5 border-b bg-muted/40 px-3 py-2.5">
        <span className="size-2.5 rounded-full bg-red-400/60" />
        <span className="size-2.5 rounded-full bg-amber-400/60" />
        <span className="size-2.5 rounded-full bg-green-400/60" />
      </div>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  )
}
