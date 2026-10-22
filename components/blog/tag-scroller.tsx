import Link from "next/link"
import type { TagSummary } from "@/lib/blog/store"
import { cn } from "@/lib/utils"

const CHIP =
  "inline-block border px-2 py-0.5 text-[0.625rem] font-semibold tracking-widest uppercase transition-colors"

/**
 * Tag pills on exactly one line, sideways instead of wrapped.
 *
 * The centering trick matters: `justify-center` with overflow parks
 * the first chip off the LEFT edge where no scroll position can reach
 * it, while `width: max-content` with auto margins collapses those
 * margins to zero on overflow — so a short row centers, a long row
 * starts flush with its first chip and scrolls from there. The edge
 * mask fades chips only where they actually reach the container's
 * border, which doubles as the "there is more this way" affordance;
 * the scrollbar itself stays hidden. The list carries its own px-4
 * (16px, past the mask's 10px fade) so the first and last pill sit
 * clear of the fade at both scroll extremes instead of looking
 * gnawed on — padding on the list travels with the scroll extent,
 * which is what makes the far end reliable.
 */
export default function TagScroller({
  tags,
  currentSlug,
  className,
}: {
  tags: TagSummary[]
  currentSlug?: string
  className?: string
}) {
  if (!tags.length) return null

  return (
    <div
      className={cn(
        "scrollbar-none overflow-x-auto scroll-smooth [mask-image:linear-gradient(to_right,transparent,black_10px,black_calc(100%_-_10px),transparent)]",
        className
      )}
    >
      <ul className="mx-auto flex w-max gap-1.5 px-4 py-1">
        {tags.map((entry) =>
          entry.slug === currentSlug ? (
            <li key={entry.slug}>
              <span
                aria-current="page"
                className={cn(
                  CHIP,
                  "border-primary bg-primary text-primary-foreground"
                )}
              >
                {entry.tag}
              </span>
            </li>
          ) : (
            <li key={entry.slug}>
              <Link
                href={`/blog/tag/${entry.slug}`}
                className={cn(
                  CHIP,
                  "border-primary/30 text-primary hover:bg-primary/10"
                )}
              >
                {entry.tag}
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  )
}
