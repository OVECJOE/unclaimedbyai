import type { IdeaOwner } from "@/lib/ideas"
import { checkedLabel } from "@/lib/ideas"

/**
 * Who this came from, kept small: a name (or "A founder"), when they
 * joined and how much they have actually checked. The counts say this
 * is a real, active account without saying more than the owner chose.
 */
export default function OwnerCard({
  owner,
  publishedAt,
  note,
}: {
  owner: IdeaOwner
  publishedAt: string | null
  note: string | null
}) {
  const initial = owner.name.charAt(0).toUpperCase()
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {owner.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={owner.avatar_url}
            alt=""
            width={44}
            height={44}
            referrerPolicy="no-referrer"
            className="size-11 border object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center border bg-primary/10 font-heading text-xl text-primary"
          >
            {initial}
          </span>
        )}
        <div className="text-sm">
          <p className="font-medium">{owner.name}</p>
          <p className="text-muted-foreground">
            {owner.member_since ? `Member since ${owner.member_since} · ` : ""}
            {owner.searches_run}{" "}
            {owner.searches_run === 1 ? "search" : "searches"} ·{" "}
            {owner.names_checked} names checked
          </p>
          {publishedAt ? (
            <p className="text-muted-foreground">
              Published {checkedLabel(publishedAt)}
            </p>
          ) : null}
        </div>
      </div>
      {note ? (
        <blockquote className="border-l-2 border-primary pl-4 text-lg text-pretty">
          {note}
        </blockquote>
      ) : null}
    </div>
  )
}
