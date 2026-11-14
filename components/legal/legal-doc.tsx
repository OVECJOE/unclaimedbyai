import Link from "next/link"
import type { ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import GsapReveal from "@/components/about/gsap-reveal"
import ReadingProgress from "@/components/blog/reading-progress"
import RegistryField from "@/components/fields/registry-field"
import { SectionHeader } from "@/components/public/section-header"
import { cn } from "@/lib/utils"
import TableOfContents from "./table-of-contents"

export type LegalSection = {
  id: string
  title: string
  /** One or two plain sentences: the point of the section. */
  plain: string
  /** The full wording, for anyone who wants the detail. */
  body: ReactNode
}

type LegalDocProps = {
  current: "privacy" | "terms"
  eyebrow: string
  title: string
  lede: string
  updated: string
  readTime: string
  /** The whole document in a few lines, shown before anything else. */
  summary: string[]
  sections: LegalSection[]
  footerNote: ReactNode
  prev?: { href: string; label: string }
  next?: { href: string; label: string }
}

const DOCS = [
  { key: "privacy", href: "/privacy", label: "Privacy" },
  { key: "terms", href: "/terms", label: "Terms" },
] as const

/**
 * A legal page built to be read. The short version comes first, in plain
 * words, so someone who reads nothing else still knows the deal. The
 * full text sits below in one column of about 68 characters, each
 * section opening with its point in a sentence or two. The contents
 * list stays beside it (a bar on phones) so any section is one tap away.
 */
export default function LegalDoc({
  current,
  eyebrow,
  title,
  lede,
  updated,
  readTime,
  summary,
  sections,
  footerNote,
  prev,
  next,
}: LegalDocProps) {
  return (
    <>
      <ReadingProgress targetId="legal-body" />
      <section className="relative isolate overflow-hidden border-b px-4 pt-16 pb-12 md:pt-24">
        <RegistryField quiet />
        <div className="mx-auto max-w-3xl space-y-8">
          <nav
            aria-label="Legal documents"
            className="mx-auto flex w-fit border text-xs font-semibold tracking-widest uppercase"
          >
            {DOCS.map((doc) => (
              <Link
                key={doc.key}
                href={doc.href}
                aria-current={doc.key === current ? "page" : undefined}
                className={cn(
                  "px-5 py-2.5 transition-colors",
                  doc.key === current
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {doc.label}
              </Link>
            ))}
          </nav>
          <SectionHeader as="h1" eyebrow={eyebrow} title={title} lede={lede}>
            <p className="font-mono text-xs text-muted-foreground">
              Last updated {updated} · {readTime} read
            </p>
          </SectionHeader>

          <aside
            aria-labelledby="short-version"
            className="border bg-card p-6 text-left sm:p-8"
          >
            <h2
              id="short-version"
              className="text-[0.6875rem] font-semibold tracking-widest text-primary uppercase"
            >
              The short version
            </h2>
            <ul className="mt-4 space-y-3">
              {summary.map((line) => (
                <li key={line} className="flex gap-3">
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    className="mt-1 size-4 shrink-0 text-primary"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-muted-foreground">
              The full text is below. Each part starts with its point in a
              sentence or two.
            </p>
          </aside>
        </div>
      </section>

      <section id="legal-body" className="px-4 py-14 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[14rem_minmax(0,42.5rem)] lg:justify-center xl:gap-16">
          <TableOfContents
            items={sections.map(({ id, title }) => ({ id, title }))}
          />
          <article className="w-full min-w-0">
            {sections.map((section) => (
              <GsapReveal
                key={section.id}
                y={16}
                start="top 90%"
                className="border-b py-10 first:pt-0"
              >
                <section
                  id={section.id}
                  aria-labelledby={`${section.id}-heading`}
                  className="scroll-mt-24"
                >
                  <h2
                    id={`${section.id}-heading`}
                    className="font-heading text-3xl leading-tight text-balance md:text-4xl"
                  >
                    {section.title}
                  </h2>
                  <p className="mt-4 border-l-2 border-primary pl-4 text-xl font-medium text-pretty">
                    {section.plain}
                  </p>
                  <div className="blog-prose mt-5">{section.body}</div>
                </section>
              </GsapReveal>
            ))}

            <div className="mt-6 space-y-4 border bg-muted/40 p-6">
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
