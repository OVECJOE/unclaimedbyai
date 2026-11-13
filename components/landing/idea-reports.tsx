import Link from "next/link"
import IdeaCardLink from "@/components/ideas/idea-card"
import { SectionHeader } from "@/components/public/section-header"
import { listIdeas } from "@/lib/ideas"

const MIN_TO_SHOW = 3

/**
 * Recent published idea reports, so a visitor can see what a finished
 * search looks like before running one. Hidden until there are enough
 * to look like a real collection rather than a lone example.
 */
export default async function IdeaReports() {
  const { items, total } = await listIdeas(3)
  if (items.length < MIN_TO_SHOW) return null

  return (
    <section className="border-b px-4 py-20 md:py-28">
      <div className="mx-auto max-w-7xl space-y-12">
        <SectionHeader
          eyebrow="Idea reports"
          title="See how real ideas"
          accent="held up."
          lede="Founders share which of their names survived the checks, which lost their .com, and which ones chatbots already link to someone else."
        />
        <ul className="grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <li key={item.slug}>
              <IdeaCardLink item={item} headingLevel="h3" />
            </li>
          ))}
        </ul>
        <p className="text-center">
          <Link
            href="/ideas"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            See all {total} idea reports
          </Link>
        </p>
      </div>
    </section>
  )
}
