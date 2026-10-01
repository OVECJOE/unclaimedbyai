import Link from "next/link"
import type { ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import TableOfContents from "./table-of-contents"

export type LegalSection = {
  id: string
  title: string
  plain: string
  body: ReactNode
}

type LegalDocProps = {
  eyebrow: string
  title: string
  lede: string
  updated: string
  readTime: string
  sections: LegalSection[]
  footerNote: ReactNode
  prev?: { href: string; label: string }
  next?: { href: string; label: string }
}

export default function LegalDoc({
  eyebrow,
  title,
  lede,
  updated,
  readTime,
  sections,
  footerNote,
  prev,
  next,
}: LegalDocProps) {
  return (
    <>
      <section className="border-b px-4 py-10">
        <div className="mx-auto max-w-3xl space-y-5 text-center">
          <Badge
            className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
            asChild
          >
            <p className="px-2 py-1 sm:px-3">{eyebrow}</p>
          </Badge>
          <h1 className="font-heading text-4xl font-semibold md:text-5xl">
            {title}
          </h1>
          <p className="mx-auto max-w-prose text-muted-foreground md:text-lg">
            {lede}
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated {updated} · {readTime} read
          </p>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <TableOfContents
            items={sections.map(({ id, title }) => ({ id, title }))}
          />
          <article className="mx-auto w-full max-w-3xl">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-heading`}
                className="scroll-mt-24 border-b py-8 first:pt-0 last:border-b-0"
              >
                <h2
                  id={`${section.id}-heading`}
                  className="font-heading text-2xl font-semibold md:text-3xl"
                >
                  <span className="mr-3 font-mono text-base text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </h2>
                <aside className="mt-4 border-l-2 border-primary bg-muted/60 p-4">
                  <p className="mb-1 text-xs font-semibold tracking-widest uppercase">
                    In plain English
                  </p>
                  <p className="text-sm">{section.plain}</p>
                </aside>
                <div className="blog-prose mt-4">{section.body}</div>
              </section>
            ))}

            <div className="mt-8 space-y-4 border bg-muted/40 p-6">
              {footerNote}
            </div>

            <nav
              aria-label="More legal documents"
              className="mt-6 flex flex-col justify-between gap-3 sm:flex-row"
            >
              {prev ? (
                <Link
                  href={prev.href}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} />
                  {prev.label}
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={next.href}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {next.label}
                  <HugeiconsIcon icon={ArrowRight01Icon} />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          </article>
        </div>
      </section>
    </>
  )
}
