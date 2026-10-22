import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import DateLabel from "@/components/blog/date-label"
import { BLOG_TITLE } from "@/lib/blog/config"
import type { TagSummary } from "@/lib/blog/store"
import TagScroller from "./tag-scroller"

/**
 * The tag archive's masthead, in the same grand pattern as the legal
 * documents' hero: a badged eyebrow that doubles as the way back to
 * the blog, a large serif headline, a lede, and a meta line — then a
 * labeled "All topics" row where the topic you are standing in is the
 * solid chip, so the row answers "where am I" instead of hiding it.
 */
export default function TagHero({
  display,
  count,
  latest,
  tags,
  currentSlug,
}: {
  display: string
  count: number
  latest: string | null
  tags: TagSummary[]
  currentSlug: string
}) {
  return (
    <section className="border-b px-4 py-12 md:py-16">
      <div className="mx-auto max-w-3xl space-y-5 text-center">
        <div className="flex justify-center">
          <Badge
            className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
            asChild
          >
            <Link href="/blog">
              <HugeiconsIcon icon={ArrowLeft01Icon} />
              {BLOG_TITLE}
            </Link>
          </Badge>
        </div>
        <h1 className="font-heading text-4xl font-semibold wrap-break-word md:text-6xl">
          {display}
        </h1>
        <div className="space-y-1">
          <p className="mx-auto max-w-prose text-muted-foreground md:text-lg">
            Everything tagged &ldquo;{display}&rdquo;, newest first.
          </p>
          <p className="text-sm text-muted-foreground">
            {count} {count === 1 ? "post" : "posts"}
            {latest ? (
              <>
                {" · Latest "}
                <DateLabel value={latest} dateStyle="long" />
              </>
            ) : null}
          </p>
        </div>
      </div>

      {tags.length > 1 ? (
        <div className="mx-auto mt-10 max-w-7xl">
          <p className="mb-3 text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            All topics
          </p>
          <TagScroller tags={tags} currentSlug={currentSlug} />
        </div>
      ) : null}
    </section>
  )
}
