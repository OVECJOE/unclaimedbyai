import Link from "next/link"
import { checkedLabel, type IdeaCard } from "@/lib/ideas"

/** One published idea in a list: who, the idea, and how it went. */
export default function IdeaCardLink({
  item,
  headingLevel = "h2",
}: {
  item: IdeaCard
  headingLevel?: "h2" | "h3"
}) {
  const Heading = headingLevel
  return (
    <Link
      href={`/ideas/${item.slug}`}
      className="group block h-full space-y-3 border p-5 transition-colors hover:border-primary/60"
    >
      <p className="text-[0.6875rem] font-semibold tracking-widest text-muted-foreground uppercase">
        {item.owner} · {checkedLabel(item.published_at)}
      </p>
      <Heading className="font-heading text-2xl leading-tight text-balance group-hover:underline group-hover:underline-offset-4">
        {item.title}
      </Heading>
      <p className="text-sm text-muted-foreground">
        {item.name_count} names tested
        {item.best
          ? `. Best: ${item.best.name} at ${item.best.score}/100.`
          : "."}
      </p>
      {item.top_names.length > 0 ? (
        <p className="flex flex-wrap gap-1.5">
          {item.top_names.map((name) => (
            <span
              key={name}
              className="border border-primary/30 px-1.5 py-0.5 text-xs text-primary"
            >
              {name}
            </span>
          ))}
        </p>
      ) : null}
    </Link>
  )
}
