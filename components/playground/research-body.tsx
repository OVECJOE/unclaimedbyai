import type { Research, ResearchSection } from "@/lib/api"
import { Button } from "@/components/ui/button"

export type ResearchLike = Pick<Research, "status" | "error"> &
  Partial<
    Pick<
      Research,
      "summary" | "competitors" | "demand" | "audience_channels" | "monetization"
    >
  >

export type SectionKey =
  | "competitors"
  | "demand"
  | "audience_channels"
  | "monetization"

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: "competitors", label: "Competitors" },
  { key: "demand", label: "Demand" },
  { key: "audience_channels", label: "Where they are" },
  { key: "monetization", label: "How it earns" },
]

export function sectionPending(research: ResearchLike): boolean {
  return SECTIONS.some((section) => research[section.key] == null)
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

function SourcesBar({ urls }: { urls: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.625rem] text-muted-foreground">
      <span className="font-semibold tracking-widest uppercase">Sources</span>
      {urls.map((url) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          {hostname(url)}
        </a>
      ))}
    </div>
  )
}

function sectionBody(key: SectionKey, value: ResearchSection) {
  if (key === "competitors") {
    return value.competitors?.length ? (
      <ul className="space-y-1.5">
        {value.competitors.map((competitor) => (
          <li key={competitor.name} className="text-sm">
            <span className="font-medium">{competitor.name}</span>
            {competitor.pricing ? (
              <span className="text-xs text-muted-foreground tabular-nums">
                {" "}
                · {competitor.pricing}
              </span>
            ) : null}
            {competitor.note ? (
              <p className="text-xs text-muted-foreground">{competitor.note}</p>
            ) : null}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-xs text-muted-foreground">
        None surfaced — the space looks genuinely open.
      </p>
    )
  }
  if (key === "demand") {
    return value.signals?.length ? (
      <ul className="space-y-1 text-sm">
        {value.signals.map((signal) => (
          <li key={signal} className="flex gap-1.5">
            <span className="text-primary">•</span>
            <span>{signal}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-xs text-muted-foreground">No demand signals landed.</p>
    )
  }
  if (key === "audience_channels") {
    return value.channels?.length ? (
      <ul className="space-y-1.5">
        {value.channels.map((channel) => (
          <li key={channel.channel} className="text-sm">
            <span className="font-medium">{channel.channel}</span>
            {channel.note ? (
              <p className="text-xs text-muted-foreground">{channel.note}</p>
            ) : null}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-xs text-muted-foreground">No channels landed.</p>
    )
  }
  return value.paths?.length ? (
    <ul className="space-y-1.5">
      {value.paths.map((path) => (
        <li key={path.model} className="text-sm">
          <span className="font-medium">{path.model}</span>
          {path.price ? (
            <span className="text-xs text-muted-foreground tabular-nums">
              {" "}
              · {path.price}
            </span>
          ) : null}
          {path.note ? (
            <p className="text-xs text-muted-foreground">{path.note}</p>
          ) : null}
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-xs text-muted-foreground">No revenue path landed.</p>
  )
}

export function ResearchBody({
  research,
  onRetry,
}: {
  research: ResearchLike
  onRetry?: (section: SectionKey) => void
}) {
  if (research.status === "failed") {
    return (
      <p className="text-sm text-destructive">
        {research.error ?? "Research failed. Try again."}
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {SECTIONS.map((section) => {
        const value = research[section.key]
        return (
          <div key={section.key} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
                {section.label}
              </p>
              {onRetry && value != null && "error" in value ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 text-xs"
                  onClick={() => onRetry(section.key)}
                >
                  Retry
                </Button>
              ) : null}
            </div>

            {value == null ? (
              <div
                className="space-y-1.5"
                aria-busy="true"
                aria-label={`${section.label}: researching`}
              >
                <div className="h-3 w-2/3 animate-pulse bg-muted" />
                <div className="h-3 w-5/6 animate-pulse bg-muted" />
              </div>
            ) : "error" in value ? (
              <div className="border border-dashed border-destructive/40 px-2 py-1.5 text-xs text-destructive">
                <p>
                  This section could not be researched. The three that worked
                  stand.
                </p>
                {value.cause ? (
                  <p className="mt-1 text-[0.625rem] break-words text-muted-foreground">
                    {value.cause}
                  </p>
                ) : null}
              </div>
            ) : (
              <>
                {sectionBody(section.key, value)}
                {value.sources?.length ? (
                  <SourcesBar urls={value.sources} />
                ) : null}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
