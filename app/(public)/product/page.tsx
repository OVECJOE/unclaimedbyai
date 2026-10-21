import { Badge } from "@/components/ui/badge"
import { CancelIcon, CheckmarkBadge03Icon } from "@hugeicons/core-free-icons"
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
import { FaqItem, FaqList } from "@/components/ui/faq-list"
import PrompterCta from "@/components/public/prompter-cta"
import type { Metadata } from "next"
import { JsonLd } from "@/components/app/json-ld"
import { SITE_NAME, SITE_URL, offersJsonLd, pageMetadata } from "@/lib/site"
import {
  DOMAIN_STATUSES,
  FAQS,
  PROOF_POINTS,
  SOCIAL_HANDLES,
} from "./constants"
import FeatureRow from "@/components/feature-row"

export const metadata: Metadata = pageMetadata({
  title: "What happens when you hit check?",
  description:
    "No black box. Live RDAP domain checks, exact social handle checks, and independent AI association checks across GPT, Claude, and Perplexity, with the receipts for each one.",
  path: "/product",
})

function TableCheck() {
  return (
    <span className="inline-flex flex-col items-center gap-0.5">
      <HugeiconsIcon
        icon={CheckmarkBadge03Icon}
        size={18}
        aria-hidden
        className="text-green-600 dark:text-green-500"
      />
      <span className="sr-only">Included</span>
    </span>
  )
}

function TableCross() {
  return (
    <span className="inline-flex flex-col items-center gap-0.5">
      <HugeiconsIcon
        icon={CancelIcon}
        size={18}
        aria-hidden
        className="text-destructive"
      />
      <span className="sr-only">Not included</span>
    </span>
  )
}

const productJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/product#app`,
      name: `${SITE_NAME} name checker`,
      url: `${SITE_URL}/product`,
      description:
        "No black box, no made-up score. Three real checks for a name: live RDAP domain lookups, exact social handle checks, and independent AI association checks across GPT, Claude, and Perplexity.",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Name checker",
      operatingSystem: "Web",
      inLanguage: "en",
      featureList: [
        "Live RDAP domain checks across .com, .ai, .io, and .co",
        "Exact social handle checks through public APIs",
        "Independent AI association checks across GPT, Claude, and Perplexity",
      ],
      offers: offersJsonLd,
      provider: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/product#faq`,
      mainEntity: FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
}

export default function ProductPage() {
  return (
    <>
      <JsonLd data={productJsonLd} />
      {/* Hero */}
      <section className="space-y-5 px-4 py-10 sm:text-center">
        <Badge
          className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
          asChild
        >
          <p className="px-2 py-1 sm:px-3">Know before you build</p>
        </Badge>
        <div className="space-y-3">
          <h1 className="mx-auto max-w-xl font-heading text-4xl font-semibold md:text-5xl">
            {/* The slogan alone names no entity; the screen-reader
                prefix gives the heading the brand and category that
                crawlers and assistive tech both key on. */}
            <span className="sr-only">Unclaimed by AI, the name checker: </span>
            What actually happens when you hit{" "}
            <span className="text-primary">&quot;check&quot;?</span>
          </h1>
          <p className="mx-auto max-w-prose md:text-lg">
            No black box, no made-up score. Three real checks, run in front of
            you, with the receipts for each one.
          </p>
        </div>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
          {PROOF_POINTS.map((point) => (
            <div
              key={point.label}
              className="flex flex-col gap-4 bg-background p-5 sm:items-center sm:py-10 sm:text-center"
            >
              <div className="flex items-center gap-2 font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
                {point.live ? (
                  <span aria-hidden className="relative flex size-2">
                    <span className="absolute inline-flex size-full bg-green-600 opacity-75 motion-safe:animate-ping" />
                    <span className="relative inline-flex size-2 bg-green-600" />
                  </span>
                ) : null}
                {point.label}
              </div>

              <p className="font-heading text-7xl leading-none text-primary">
                {point.value}
              </p>

              <p className="text-sm sm:text-base">{point.caption}</p>

              <ul className="flex flex-wrap gap-2 sm:justify-center">
                {point.chips.map((chip) => (
                  <li
                    key={chip}
                    className="border border-dashed border-primary/30 bg-primary/5 px-2 py-1 font-mono text-xs text-primary"
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* What we check */}
      <section className="border-b px-4">
        <div className="mx-auto max-w-7xl divide-y">
          <FeatureRow
            index="01"
            badge="Domains"
            title="Checked live, not cached"
            preview={
              <div className="flex flex-col gap-3 font-mono text-sm">
                {DOMAIN_STATUSES.map((row) => (
                  <div
                    key={row.domain}
                    className="flex items-center justify-between"
                  >
                    <span>{row.domain}</span>
                    <span
                      className={cn(
                        row.available
                          ? "text-green-700 dark:text-green-500"
                          : "text-red-700 dark:text-red-500"
                      )}
                    >
                      {row.available ? "Open" : "Taken"}
                    </span>
                  </div>
                ))}
              </div>
            }
          >
            We check .com, .ai, .io, and .co through RDAP, the same protocol
            registrars use internally, not a WHOIS mirror that could be three
            months stale. If we say a domain&apos;s open, it was open in the
            last few seconds.
          </FeatureRow>

          <FeatureRow
            index="02"
            badge="Social Handles"
            title="Checked honestly"
            reverse
            preview={
              <div className="space-y-3">
                {SOCIAL_HANDLES.map((row) => (
                  <div
                    key={row.handle}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex min-w-0 items-center gap-1.5">
                      <HugeiconsIcon
                        icon={row.icon}
                        className="h-4 w-4 shrink-0"
                      />
                      <span className="truncate text-xs">{row.handle}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <span
                        className={cn("text-xs", {
                          "text-green-700 dark:text-green-500": row.open,
                          "text-amber-700 dark:text-amber-400": !row.open,
                        })}
                      >
                        {row.open ? "open" : "taken"}
                      </span>
                      <span className="text-muted-foreground">&middot;</span>
                      <span
                        className={cn("text-xs", {
                          "text-green-700 dark:text-green-500": row.exact,
                          "text-amber-700 dark:text-amber-400": !row.exact,
                        })}
                      >
                        {row.exact ? "exact" : "best guess"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            GitHub has a public API that gives a straight yes or no, so those
            results are exact. X, Instagram, TikTok and YouTube don&apos;t offer
            that, so we check the live profile page instead and label it a best
            guess. We&apos;d rather tell you the limit than fake a green
            checkmark.
          </FeatureRow>
        </div>
      </section>

      {/* About AI associations */}
      <section className="border-b bg-primary/5 px-4 py-12 md:py-20">
        <article className="mx-auto max-w-3xl space-y-6 text-center">
          <Badge variant="ghost" className="text-primary">
            The check nobody else runs
          </Badge>
          <h2 className="font-heading text-3xl font-medium text-balance sm:text-4xl md:text-5xl">
            <q>
              Ask ChatGPT about your product idea&apos;s name before you spend
              money on it.
            </q>
          </h2>
          <p className="mx-auto max-w-prose text-base sm:text-lg">
            If it already has an answer, you&apos;ve got a problem no domain
            search will ever catch. We ask three models the same question,
            independently.
          </p>

          <div className="grid gap-px overflow-hidden border bg-border text-start sm:grid-cols-2">
            <div className="space-y-1 bg-background p-4">
              <p className="font-mono text-xs tracking-[0.12em] text-green-700 uppercase dark:text-green-500">
                Shrug
              </p>
              <p>A children&apos;s book character from 1995</p>
            </div>
            <div className="space-y-1 bg-background p-4">
              <p className="font-mono text-xs tracking-[0.12em] text-red-700 uppercase dark:text-red-500">
                Rethink the name
              </p>
              <p>A live SaaS company in your exact category</p>
            </div>
          </div>

          <ul className="flex flex-wrap justify-center gap-3">
            {["GPT", "Claude Sonnet", "Perplexity Sonar"].map((model) => (
              <li key={model}>
                <Badge variant="outline" className="border px-5 py-2">
                  {model}
                </Badge>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* Free generator */}
      <section className="border-b sm:text-center">
        <div className="mx-auto max-w-7xl space-y-5 px-4 py-10">
          <h2 className="font-heading text-3xl font-medium sm:text-4xl">
            Where a free generator stops
          </h2>
          <Table>
            <TableCaption className="mt-4 text-muted-foreground">
              The same three checks, side by side with the free generators and a
              lawyer&apos;s trademark search.
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
                  <TableCheck />
                </TableCell>

                <TableCell className="text-center text-muted-foreground">
                  sometimes
                </TableCell>

                <TableCell className="text-center">
                  <TableCross />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Social handles</TableCell>

                <TableCell className="bg-primary/10 text-center">
                  <TableCheck />
                </TableCell>

                <TableCell className="text-center">
                  <TableCross />
                </TableCell>

                <TableCell className="text-center">
                  <TableCross />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">
                  AI collision check
                </TableCell>

                <TableCell className="bg-primary/10 text-center">
                  <TableCheck />
                </TableCell>

                <TableCell className="text-center">
                  <TableCross />
                </TableCell>

                <TableCell className="text-center">
                  <TableCross />
                </TableCell>
              </TableRow>

              <TableRow className="hover:bg-transparent">
                <TableCell className="font-medium">Price to start</TableCell>

                <TableCell className="bg-primary/10 text-center font-semibold">
                  free
                </TableCell>

                <TableCell className="text-center text-muted-foreground">
                  free
                </TableCell>

                <TableCell className="text-center text-muted-foreground">
                  $400+
                </TableCell>
              </TableRow>

              <TableRow className="hover:bg-transparent">
                <TableCell className="font-medium">
                  After the free check
                </TableCell>

                <TableCell className="bg-primary/10 text-center font-semibold">
                  1 credit
                </TableCell>

                <TableCell className="text-center text-muted-foreground">
                  nothing left
                </TableCell>

                <TableCell className="text-center text-muted-foreground">
                  per search
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="text-start text-xs text-muted-foreground sm:hidden">
            Swipe the table to compare all three columns.
          </p>
        </div>
      </section>

      {/* Frequently asked questions */}
      <section id="faq" className="scroll-mt-20 border-b px-4 py-10">
        <div className="mx-auto max-w-7xl space-y-5">
          <h2 className="font-heading text-3xl font-medium sm:text-center sm:text-4xl">
            Questions people actually ask
          </h2>
          <FaqList>
            {FAQS.map((faq) => (
              <FaqItem
                key={faq.id}
                question={faq.question}
                open={
                  faq.id === "what-does-unclaimedbyai-check-when-i-enter-a-name"
                }
              >
                {/* The schema keeps the plain answer; the row shows the
                    rich body when an entry earned one. */}
                {faq.body ?? faq.answer}
              </FaqItem>
            ))}
          </FaqList>
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
        <PrompterCta />
      </section>
    </>
  )
}
