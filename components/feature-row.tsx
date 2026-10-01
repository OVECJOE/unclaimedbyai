import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { PreviewCard } from "@/components/preview-card"

export default function FeatureRow({
  index,
  badge,
  title,
  preview,
  reverse = false,
  children,
}: {
  index: string
  badge: string
  title: string
  preview: React.ReactNode
  reverse?: boolean
  children: React.ReactNode
}) {
  return (
    <article className="grid items-center gap-8 py-10 md:grid-cols-2 md:gap-16 md:py-16">
      <div className={cn("space-y-3", reverse && "md:order-2")}>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">
            {index}
          </span>
          <Badge className="font-heading text-xs text-primary">{badge}</Badge>
        </div>
        <h2 className="font-heading text-2xl font-medium sm:text-3xl">
          {title}
        </h2>
        <p className="max-w-prose text-base leading-7 sm:text-lg">{children}</p>
      </div>
      <PreviewCard
        className={cn(
          "w-full md:max-w-md md:justify-self-center",
          reverse && "md:order-1"
        )}
      >
        {preview}
      </PreviewCard>
    </article>
  )
}
