import FreeDomainChips from "@/components/public/free-domain-chips"
import type { CheckReport } from "@/lib/api"
import { COLLISION_AT } from "@/lib/ideas"
import { cn } from "@/lib/utils"

/**
 * The answer to "is this name still free?", read straight off one
 * check: the sentence a person wants first, then the three results
 * behind it in plain words. Shared by the public name page and the
 * public search page so both say the same thing the same way.
 */

type Facts = {
  comStatus: "free" | "taken" | "unknown"
  freeDomains: CheckReport["domains"]
  domainsChecked: number
  openHandles: number
  takenHandles: CheckReport["socials"]
  handlesChecked: number
  peak: number
  confused: CheckReport["ai"]
  answered: number
}

export function factsOf(report: CheckReport): Facts {
  const com = report.domains.find((domain) => domain.tld === "com")
  const known = report.domains.filter(
    (domain) => domain.status === "available" || domain.status === "taken"
  )
  const socials = report.socials.filter(
    (social) => social.status === "available" || social.status === "taken"
  )
  const answers = report.ai.filter((row) => !row.error)
  return {
    comStatus:
      com?.status === "available"
        ? "free"
        : com?.status === "taken"
          ? "taken"
          : "unknown",
    freeDomains: report.domains.filter(
      (domain) => domain.status === "available"
    ),
    domainsChecked: known.length,
    openHandles: socials.filter((social) => social.status === "available")
      .length,
    takenHandles: socials.filter((social) => social.status === "taken"),
    handlesChecked: socials.length,
    peak: answers.reduce(
      (best, row) => Math.max(best, row.collision_confidence ?? 0),
      0
    ),
    confused: answers.filter(
      (row) => (row.collision_confidence ?? 0) >= COLLISION_AT
    ),
    answered: answers.length,
  }
}

const PLATFORM: Record<string, string> = {
  x: "X",
  github: "GitHub",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  npm: "npm",
  linkedin: "LinkedIn",
}
const platformName = (key: string) => PLATFORM[key] ?? key

/** The one-sentence answer, honest in both directions. */
export function answerLine(report: CheckReport): string {
  const facts = factsOf(report)
  const problems: string[] = []
  if (facts.comStatus === "taken") problems.push("the .com is taken")
  if (facts.takenHandles.length > 0) {
    const names = facts.takenHandles.map((social) =>
      platformName(social.platform)
    )
    problems.push(
      `${names.slice(0, 3).join(", ")}${names.length > 3 ? " and more" : ""} ${
        names.length === 1 ? "has" : "have"
      } the handle already`
    )
  }
  if (facts.confused.length > 0) {
    problems.push("a chatbot already ties it to another brand")
  }
  if (problems.length === 0) {
    return `Yes. ${
      facts.comStatus === "free" ? "The .com is free, " : ""
    }every handle we checked is open, and no chatbot confused it with another brand.`
  }
  const text =
    problems.length > 1
      ? `${problems.slice(0, -1).join(", ")} and ${problems[problems.length - 1]}`
      : problems[0]
  return `Not completely. ${text.charAt(0).toUpperCase()}${text.slice(1)}.`
}

function Card({
  label,
  status,
  tone,
  children,
}: {
  label: string
  status: string
  tone: "good" | "warn" | "bad" | "quiet"
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3 bg-background p-5">
      <p className="text-[0.6875rem] font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "font-heading text-2xl leading-tight text-balance",
          tone === "good" && "text-green-700 dark:text-green-400",
          tone === "warn" && "text-amber-700 dark:text-amber-400",
          tone === "bad" && "text-destructive"
        )}
      >
        {status}
      </p>
      <div className="space-y-2 text-sm text-muted-foreground">{children}</div>
    </div>
  )
}

export default function NameVerdict({ report }: { report: CheckReport }) {
  const facts = factsOf(report)
  const topAi = [...facts.confused].sort(
    (a, b) => (b.collision_confidence ?? 0) - (a.collision_confidence ?? 0)
  )[0]

  return (
    <div className="grid gap-px border bg-border md:grid-cols-3">
      <Card
        label="Website address"
        tone={
          facts.comStatus === "free"
            ? "good"
            : facts.comStatus === "taken"
              ? "bad"
              : "quiet"
        }
        status={
          facts.comStatus === "free"
            ? "The .com is free"
            : facts.comStatus === "taken"
              ? "The .com is taken"
              : "The .com wasn't confirmed"
        }
      >
        <p>
          {facts.freeDomains.length} of {facts.domainsChecked} extensions
          checked are free to register.
        </p>
        <FreeDomainChips domains={facts.freeDomains.slice(0, 4)} />
        {facts.freeDomains.length > 4 ? (
          <p className="text-xs">
            And {facts.freeDomains.length - 4} more free extensions.
          </p>
        ) : null}
      </Card>

      <Card
        label="Social usernames"
        tone={
          facts.handlesChecked === 0
            ? "quiet"
            : facts.takenHandles.length === 0
              ? "good"
              : facts.openHandles === 0
                ? "bad"
                : "warn"
        }
        status={
          facts.handlesChecked === 0
            ? "Not confirmed"
            : facts.takenHandles.length === 0
              ? "Every handle is open"
              : `${facts.takenHandles.length} of ${facts.handlesChecked} already taken`
        }
      >
        {facts.takenHandles.length > 0 ? (
          <p className="flex flex-wrap gap-1.5">
            {facts.takenHandles.map((social) => (
              <span
                key={social.platform}
                className="border px-1.5 py-0.5 text-xs text-foreground"
              >
                {platformName(social.platform)}
              </span>
            ))}
          </p>
        ) : null}
        <p>
          {facts.openHandles} of {facts.handlesChecked} usernames are still
          open.
        </p>
      </Card>

      <Card
        label="What chatbots say"
        tone={
          facts.answered === 0
            ? "quiet"
            : facts.confused.length === 0
              ? "good"
              : facts.peak >= 70
                ? "bad"
                : "warn"
        }
        status={
          facts.answered === 0
            ? "Chatbots couldn't be asked"
            : facts.confused.length === 0
              ? "No brand confusion"
              : `${facts.confused.length} of ${facts.answered} link it to a brand`
        }
      >
        {topAi?.association ? (
          <blockquote className="border-l-2 border-primary pl-3 text-foreground">
            &ldquo;{topAi.association}&rdquo;
            <span className="mt-1 block text-xs text-muted-foreground">
              {topAi.model ?? "A chatbot"}, when asked about this name
            </span>
          </blockquote>
        ) : facts.answered === 0 ? (
          <p>
            The chatbot check didn&apos;t finish for this name, so we can&apos;t
            say what they know about it. Run a fresh check to try again.
          </p>
        ) : (
          <p>
            We asked {facts.answered} chatbot{facts.answered === 1 ? "" : "s"}{" "}
            what they already know about this name. None tied it to another
            brand.
          </p>
        )}
      </Card>
    </div>
  )
}
