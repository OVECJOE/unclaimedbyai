import { PreviewCard } from "@/components/preview-card"
import { Badge } from "@/components/ui/badge"
import { GithubIcon, InstagramIcon, NewTwitterIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"

const DOMAIN_STATUSES = [
  { domain: "vantis.com", available: false },
  { domain: "vantis.ai", available: true },
  { domain: "vantis.io", available: true },
]

const SOCIAL_HANDLES = [
  {
    icon: NewTwitterIcon,
    handle: "x.com/vantis",
    open: true,
    exact: false,
  },
  {
    icon: GithubIcon,
    handle: "github.com/vantis",
    open: false,
    exact: true,
  },
  {
    icon: InstagramIcon,
    handle: "instagram.com/vantis",
    open: true,
    exact: false,
  }
]

export default function ProductPage() {
  return (
    <>
      {/* Hero */}
      <section className="space-y-5 px-4 py-10 sm:text-center">
        <Badge
          className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
          asChild
        >
          <p className="px-2 py-1 sm:px-3">
            For founders who&apos;d rather know now
            <br />
            than find out later
          </p>
        </Badge>
        <div className="space-y-3">
          <h1 className="font-heading text-4xl font-semibold md:text-5xl max-w-xl mx-auto">
            What actually happens when
            you hit <span className="text-primary">&quot;check&quot;?</span>
          </h1>
          <p className="mx-auto max-w-prose md:text-lg">
            No black box, no made-up score. Three real checks, run in front of
            you, with the receipts for each one.
          </p>
        </div>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="space-y-3 border border-dashed border-primary/30 bg-primary/5 p-4 sm:bg-none sm:px-4 sm:py-10 sm:text-center">
            <h2 className="font-heading text-5xl font-bold text-primary">4</h2>
            <p className="text-sm text-primary sm:text-lg">
              registries checked live, by RDAP
            </p>
          </div>
          <div className="space-y-3 border border-dashed border-primary/30 bg-primary/5 p-4 sm:bg-none sm:px-4 sm:py-10 sm:text-center">
            <h2 className="font-heading text-5xl font-bold text-primary">2</h2>
            <p className="text-sm text-primary sm:text-lg">
              platforms verified with an exact API
            </p>
          </div>
          <div className="space-y-3 border border-dashed border-primary/30 bg-primary/5 p-4 sm:bg-none sm:px-4 sm:py-10 sm:text-center">
            <h2 className="font-heading text-5xl font-bold text-primary">5</h2>
            <p className="text-sm text-primary sm:text-lg">
              models asked, independently, no hints
            </p>
          </div>
        </div>
      </section>

      {/* What we check */}
      <section className="border-b px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-10 md:space-y-20 sm:text-center">
          <article className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-3">
            <div className="space-y-2 flex-1 md:text-start">
              <Badge className="text-xs font-heading text-primary">Domains</Badge>
              <h2 className="text-lg sm:text-xl font-semibold">Checked live, not cached</h2>
              <p className="mt-2 text-sm sm:text-lg mx-auto md:mx-0 md:max-w-lg">
                We check .com, .ai, .io, and .co through RDAP — the same protocol registrars use internally, not a WHOIS mirror that could be three months stale. If we say a domain&apos;s open, it was open in the last few seconds.
              </p>
            </div>
            <PreviewCard className="flex-1 mx-auto">
              <div className="flex flex-col gap-3 font-mono text-sm">
                {DOMAIN_STATUSES.map((row) => (
                  <div
                    key={row.domain}
                    className="flex items-center justify-between"
                  >
                    <span>{row.domain}</span>
                    <span
                      className={
                        row.available ? "text-green-700" : "text-red-700"
                      }
                    >
                      {row.available ? "Open" : "Taken"}
                    </span>
                  </div>
                ))}
              </div>
            </PreviewCard>
          </article>
          <article className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-3">
            <div className="space-y-2 flex-1 text-start sm:text-center md:text-end md:order-2">
              <Badge className="text-xs font-heading text-primary">Social Handles</Badge>
              <h2 className="text-lg sm:text-xl font-semibold">Checked honestly</h2>
              <p className="mt-2 text-sm sm:text-lg md:max-w-lg md:ml-auto">
                GitHub and npm have public APIs that give a straight yes or no — those are exact. X and Instagram don&apos;t offer that, so we check the live profile page instead and label it a best guess. We&apos;d rather tell you the limit than fake a green checkmark.
              </p>
            </div>
            <PreviewCard className="flex-1 md:order-1 mx-auto">
              <div>
                {SOCIAL_HANDLES.map((row) => (
                  <div
                    key={row.handle}
                    className="grid grid-cols-2 gap-5 w-full"
                  >
                    <div className="flex items-center gap-1.5">
                      <HugeiconsIcon icon={row.icon} className="w-4 h-4" />
                      <span className="text-xs">{row.handle}</span>
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                      <span className={cn("text-xs", {
                        "text-green-700": row.open,
                        "text-amber-500": !row.open,
                      })}>
                        {row.open ? "open" : "taken"}
                      </span>
                      <span className="text-muted-foreground">&middot;</span>
                      <span className={cn("text-xs", {
                        "text-green-700": row.exact,
                        "text-amber-500": !row.exact,
                      })}>
                        {row.exact ? "exact" : "best guess"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </PreviewCard>
          </article>

          {/* About AI association (a different layout) */}
          <article className="sm:text-center space-y-3 my-5">
            <Badge variant="ghost" className="text-primary">
              The check nobody else runs
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-medium font-heading">
              <q>Ask ChatGPT about your product idea&apos;s name before you spend money on it.</q>
            </h2>
            <p className="text-lg mx-auto max-w-prose">If it already has an answer, you&apos;ve got a problem no domain search will ever catch. We ask three models the same question, independently. A children&apos;s book character from 1995 is a shrug. A live SaaS company in your exact category is not.</p>
            <div className="flex items-center justify-center gap-3">
              <Badge variant="outline" className="border py-2 px-5">GPT</Badge>
              <Badge variant="outline" className="border py-2 px-5">Claude Sonnet</Badge>
              <Badge variant="outline" className="border py-2 px-5">Gemini</Badge>
            </div>
          </article>
        </div>
      </section>

      {/* TODO: Report, free generator, and faq */}
    </>
  )
}
