import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiChat02Icon,
  ChatGptIcon,
  ClaudeIcon,
  GithubIcon,
  GlobeIcon,
  InstagramIcon,
  NewTwitterIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons"
import { TONE } from "@/components/public/section-header"
import type { Row, RowKind } from "@/lib/landing-reports"
import { cn } from "@/lib/utils"

const ICONS: Record<RowKind, typeof GlobeIcon> = {
  domain: GlobeIcon,
  github: GithubIcon,
  x: NewTwitterIcon,
  instagram: InstagramIcon,
  tiktok: TiktokIcon,
  youtube: YoutubeIcon,
  chatgpt: ChatGptIcon,
  claude: ClaudeIcon,
  perplexity: AiChat02Icon,
}

/** One group of a report (domains, usernames or chatbots) as a list. */
export default function ReportRows({
  rows,
  offset = 0,
  animate = false,
  className,
}: {
  rows: Row[]
  offset?: number
  animate?: boolean
  className?: string
}) {
  return (
    <ul className={cn("space-y-2 font-mono text-[0.8125rem]", className)}>
      {rows.map((row, index) => (
        <li
          key={row.label}
          className={cn(
            "flex items-center justify-between gap-3",
            animate && "row-in"
          )}
          style={animate ? { animationDelay: `${(offset + index) * 70}ms` } : undefined}
        >
          <span className="flex min-w-0 items-center gap-2">
            <HugeiconsIcon
              icon={ICONS[row.kind]}
              className="size-3.5 shrink-0 text-muted-foreground"
            />
            <span className="truncate">{row.label}</span>
          </span>
          <span className={cn("shrink-0", TONE[row.tone])}>{row.value}</span>
        </li>
      ))}
    </ul>
  )
}
