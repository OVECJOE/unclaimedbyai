import { PreviewCard } from "@/components/preview-card"
import { Badge } from "@/components/ui/badge"
import {
  CancelIcon,
  CheckmarkBadge03Icon,
  GithubIcon,
  InstagramIcon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Prompter from "@/components/prompter"

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
  },
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
          <h1 className="mx-auto max-w-xl font-heading text-4xl font-semibold md:text-5xl">
            What actually happens when you hit{" "}
            <span className="text-primary">&quot;check&quot;?</span>
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
        <div className="mx-auto max-w-7xl space-y-10 sm:text-center md:space-y-20">
          <article className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-3">
            <div className="flex-1 space-y-2 md:text-start">
              <Badge className="font-heading text-xs text-primary">
                Domains
              </Badge>
              <h2 className="text-lg font-semibold sm:text-xl">
                Checked live, not cached
              </h2>
              <p className="mx-auto mt-2 text-sm sm:text-lg md:mx-0 md:max-w-lg">
                We check .com, .ai, .io, and .co through RDAP — the same
                protocol registrars use internally, not a WHOIS mirror that
                could be three months stale. If we say a domain&apos;s open, it
                was open in the last few seconds.
              </p>
            </div>
            <PreviewCard className="mx-auto flex-1">
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
          <article className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-3">
            <div className="flex-1 space-y-2 text-start sm:text-center md:order-2 md:text-end">
              <Badge className="font-heading text-xs text-primary">
                Social Handles
              </Badge>
              <h2 className="text-lg font-semibold sm:text-xl">
                Checked honestly
              </h2>
              <p className="mt-2 text-sm sm:text-lg md:ml-auto md:max-w-lg">
                GitHub and npm have public APIs that give a straight yes or no —
                those are exact. X and Instagram don&apos;t offer that, so we
                check the live profile page instead and label it a best guess.
                We&apos;d rather tell you the limit than fake a green checkmark.
              </p>
            </div>
            <PreviewCard className="mx-auto flex-1 md:order-1">
              <div>
                {SOCIAL_HANDLES.map((row) => (
                  <div
                    key={row.handle}
                    className="grid w-full grid-cols-2 gap-5"
                  >
                    <div className="flex items-center gap-1.5">
                      <HugeiconsIcon icon={row.icon} className="h-4 w-4" />
                      <span className="text-xs">{row.handle}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <span
                        className={cn("text-xs", {
                          "text-green-700": row.open,
                          "text-amber-500": !row.open,
                        })}
                      >
                        {row.open ? "open" : "taken"}
                      </span>
                      <span className="text-muted-foreground">&middot;</span>
                      <span
                        className={cn("text-xs", {
                          "text-green-700": row.exact,
                          "text-amber-500": !row.exact,
                        })}
                      >
                        {row.exact ? "exact" : "best guess"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </PreviewCard>
          </article>

          {/* About AI association (a different layout) */}
          <article className="my-5 space-y-3 sm:text-center">
            <Badge variant="ghost" className="text-primary">
              The check nobody else runs
            </Badge>
            <h2 className="font-heading text-3xl font-medium sm:text-4xl">
              <q>
                Ask ChatGPT about your product idea&apos;s name before you spend
                money on it.
              </q>
            </h2>
            <p className="mx-auto max-w-prose text-lg">
              If it already has an answer, you&apos;ve got a problem no domain
              search will ever catch. We ask three models the same question,
              independently. A children&apos;s book character from 1995 is a
              shrug. A live SaaS company in your exact category is not.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Badge variant="outline" className="border px-5 py-2">
                GPT
              </Badge>
              <Badge variant="outline" className="border px-5 py-2">
                Claude Sonnet
              </Badge>
              <Badge variant="outline" className="border px-5 py-2">
                Gemini
              </Badge>
            </div>
          </article>
        </div>
      </section>

      {/* Free generator */}
      <section className="border-b sm:text-center">
        <div className="mx-auto max-w-7xl space-y-5 px-4 py-10">
          <h2 className="font-heading text-3xl font-medium sm:text-4xl">
            Where a free generator stops
          </h2>
          <Table>
            <TableCaption className="mt-4 text-muted-foreground">
              We empower you to build your dream without the complexity of
              picking a name.
            </TableCaption>

            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-56" />

                <TableHead className="bg-primary/10 text-center font-semibold text-primary">
                  Unclaimed
                </TableHead>

                <TableHead className="text-center font-semibold">
                  Free generator
                </TableHead>

                <TableHead className="text-center font-semibold">
                  Trademark search
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Domain check</TableCell>

                <TableCell className="bg-primary/10 text-center">
                  <HugeiconsIcon
                    icon={CheckmarkBadge03Icon}
                    size={18}
                    className="mx-auto text-green-600 dark:text-green-500"
                  />
                </TableCell>

                <TableCell className="text-center text-muted-foreground">
                  sometimes
                </TableCell>

                <TableCell className="text-center">
                  <HugeiconsIcon
                    icon={CancelIcon}
                    size={18}
                    className="mx-auto text-destructive"
                  />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Social handles</TableCell>

                <TableCell className="bg-primary/10 text-center">
                  <HugeiconsIcon
                    icon={CheckmarkBadge03Icon}
                    size={18}
                    className="mx-auto text-green-600 dark:text-green-500"
                  />
                </TableCell>

                <TableCell className="text-center">
                  <HugeiconsIcon
                    icon={CancelIcon}
                    size={18}
                    className="mx-auto text-destructive"
                  />
                </TableCell>

                <TableCell className="text-center">
                  <HugeiconsIcon
                    icon={CancelIcon}
                    size={18}
                    className="mx-auto text-destructive"
                  />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">
                  AI collision check
                </TableCell>

                <TableCell className="bg-primary/10 text-center">
                  <HugeiconsIcon
                    icon={CheckmarkBadge03Icon}
                    size={18}
                    className="mx-auto text-green-600 dark:text-green-500"
                  />
                </TableCell>

                <TableCell className="text-center">
                  <HugeiconsIcon
                    icon={CancelIcon}
                    size={18}
                    className="mx-auto text-destructive"
                  />
                </TableCell>

                <TableCell className="text-center">
                  <HugeiconsIcon
                    icon={CancelIcon}
                    size={18}
                    className="mx-auto text-destructive"
                  />
                </TableCell>
              </TableRow>

              <TableRow className="hover:bg-transparent">
                <TableCell className="font-medium">Price</TableCell>

                <TableCell className="bg-primary/10 text-center font-semibold">
                  $1.49
                </TableCell>

                <TableCell className="text-center text-muted-foreground">
                  free
                </TableCell>

                <TableCell className="text-center text-muted-foreground">
                  $400+
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Frequently asked questions */}
      <section className="border-b px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-5">
          <h2 className="font-heading text-3xl font-medium sm:text-center sm:text-4xl">
            Questions people actually ask
          </h2>
          <Accordion type="single" defaultValue={"need-an-account-to-try"}>
            <AccordionItem value="need-an-account-to-try">
              <AccordionTrigger className="text-xl">
                Do I need an account to try it?
              </AccordionTrigger>
              <AccordionContent className="text-lg">
                No. Generating and checking names is free without signing up.
                You only need an account to buy a full report or save your
                history.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="how-accurate-is-the-ai-association-check">
              <AccordionTrigger className="text-xl">
                How accurate is the AI association check?
              </AccordionTrigger>
              <AccordionContent className="text-lg">
                It&apos;s a warning system, not a guarantee. If three separate
                models already recognize your name, that&apos;s a real signal.
                If none of them do, it means none of them have run into it yet —
                not that no model ever will.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="what-if-none-of-the-generated-names-work">
              <AccordionTrigger className="text-xl">
                What if none of the generated names work?
              </AccordionTrigger>
              <AccordionContent className="text-lg">
                Type your own. The same box that generates names will check any
                name you already have in mind, the same way.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="why-does-com-show-as-taken-but-ai-as-open">
              <AccordionTrigger className="text-xl">
                Why does .com show as taken but .ai as open?
              </AccordionTrigger>
              <AccordionContent className="text-lg">
                They&apos;re different registries with different owners. A name
                can be wide open on a newer TLD and long gone on .com. We show
                you both instead of picking one.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Prompt user to check */}
      <section className="space-y-5 px-4 py-10 sm:text-center">
        <div className="space-y-2">
          <h2 className="font-heading text-3xl font-medium sm:text-center sm:text-4xl">
            Type the name you&apos;re actually considering.
          </h2>
          <p className="text-lg text-muted-foreground">
            We&apos;ll tell you the truth about it in under a minute.
          </p>
        </div>
        <Prompter />
      </section>
    </>
  )
}
