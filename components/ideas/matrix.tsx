import type { NameFacts } from "@/lib/ideas"
import { cn } from "@/lib/utils"

const TLD_ORDER = ["com", "ai", "io", "co", "app", "dev"]
const PLATFORM_ORDER = ["github", "x", "instagram", "npm", "tiktok", "youtube"]
const PLATFORM_LABEL: Record<string, string> = {
  github: "GitHub",
  x: "X",
  instagram: "Instagram",
  npm: "npm",
  tiktok: "TikTok",
  youtube: "YouTube",
}

function pick(present: Set<string>, order: string[], max: number): string[] {
  const known = order.filter((key) => present.has(key))
  const rest = [...present].filter((key) => !order.includes(key)).sort()
  return [...known, ...rest].slice(0, max)
}

function Cell({ state, label }: { state: boolean | null; label: string }) {
  return (
    <td className="p-1 text-center">
      <span
        title={label}
        className={cn(
          "mx-auto flex size-7 items-center justify-center border text-xs font-semibold",
          state === true &&
            "border-green-600/40 bg-green-600/15 text-green-700 dark:text-green-400",
          state === false &&
            "border-border bg-muted text-muted-foreground line-through",
          state === null && "border-dashed text-muted-foreground"
        )}
      >
        {state === true ? "✓" : state === false ? "✕" : "?"}
        <span className="sr-only">{label}</span>
      </span>
    </td>
  )
}

/**
 * Names down the side, every check across the top. The whole result at
 * a glance: a column of green is a good sign, and the one red cell that
 * killed a name sits right where you can see it.
 */
export default function Matrix({ facts }: { facts: NameFacts[] }) {
  const tlds = new Set<string>()
  const platforms = new Set<string>()
  for (const { name } of facts) {
    for (const domain of name.domains) tlds.add(domain.tld)
    for (const social of name.socials) platforms.add(social.platform)
  }
  const domainCols = pick(tlds, TLD_ORDER, 4)
  const handleCols = pick(platforms, PLATFORM_ORDER, 4)

  return (
    <figure className="space-y-3">
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <thead>
            <tr className="text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
              <th scope="col" className="p-1 text-left font-semibold">
                Name
              </th>
              {domainCols.map((tld) => (
                <th
                  key={tld}
                  scope="col"
                  className="p-1 text-center font-semibold"
                >
                  .{tld}
                </th>
              ))}
              {handleCols.map((platform) => (
                <th
                  key={platform}
                  scope="col"
                  className="p-1 text-center font-semibold"
                >
                  {PLATFORM_LABEL[platform] ?? platform}
                </th>
              ))}
              <th scope="col" className="p-1 text-center font-semibold">
                Chatbots
              </th>
            </tr>
          </thead>
          <tbody>
            {facts.map((entry) => (
              <tr key={entry.name.id} className="border-t">
                <th
                  scope="row"
                  className="max-w-40 truncate p-1 pr-3 text-left font-medium"
                >
                  {entry.name.name}
                </th>
                {domainCols.map((tld) => {
                  const found = entry.name.domains.find((d) => d.tld === tld)
                  return (
                    <Cell
                      key={tld}
                      state={found ? found.available : null}
                      label={`${entry.name.name}.${tld} ${
                        found?.available === true
                          ? "is free"
                          : found?.available === false
                            ? "is taken"
                            : "was not confirmed"
                      }`}
                    />
                  )
                })}
                {handleCols.map((platform) => {
                  const found = entry.name.socials.find(
                    (s) => s.platform === platform
                  )
                  return (
                    <Cell
                      key={platform}
                      state={found ? found.available : null}
                      label={`${PLATFORM_LABEL[platform] ?? platform} handle ${
                        found?.available === true
                          ? "is open"
                          : found?.available === false
                            ? "is taken"
                            : "was not confirmed"
                      }`}
                    />
                  )
                })}
                <td className="p-1 text-center">
                  <span
                    title={`Highest overlap with another brand: ${entry.peak} out of 100`}
                    className={cn(
                      "mx-auto flex h-7 min-w-7 items-center justify-center border px-1 text-xs font-semibold tabular-nums",
                      entry.confusedBy.length === 0
                        ? "border-green-600/40 bg-green-600/15 text-green-700 dark:text-green-400"
                        : entry.peak >= 70
                          ? "border-destructive/40 bg-destructive/10 text-destructive"
                          : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    )}
                  >
                    {entry.peak}
                    <span className="sr-only">
                      {" "}
                      out of 100 overlap with another brand
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>✓ free or open</span>
        <span>✕ taken</span>
        <span>? not confirmed</span>
        <span>Chatbots: 0 means no overlap, 30 or more is a warning</span>
      </figcaption>
    </figure>
  )
}
