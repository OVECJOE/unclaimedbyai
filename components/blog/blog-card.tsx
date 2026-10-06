import Link from "next/link"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { PostSummary } from "@/lib/blog/types"

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" })

function Doodle({ variant }: { variant: number }) {
  if (variant === 1) {
    return (
      <svg
        viewBox="0 0 120 120"
        aria-hidden="true"
        className="absolute -top-6 -right-6 size-36 text-primary/25"
        fill="currentColor"
      >
        {Array.from({ length: 25 }).map((_, i) => (
          <circle
            key={i}
            cx={12 + (i % 5) * 24}
            cy={12 + Math.floor(i / 5) * 24}
            r={i % 5 === 2 && Math.floor(i / 5) === 2 ? 5 : 2}
          />
        ))}
        <rect x={72} y={104} width={36} height={6} rx={3} />
      </svg>
    )
  }
  if (variant === 2) {
    return (
      <svg
        viewBox="0 0 120 120"
        aria-hidden="true"
        className="absolute -top-8 -right-8 size-40 text-primary/25"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
      >
        <circle cx={120} cy={0} r={88} />
        <circle cx={120} cy={0} r={58} />
        <circle cx={120} cy={0} r={28} fill="currentColor" stroke="none" />
        <path d="M18 92h16M26 84v16" strokeWidth={4} strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className="absolute -top-6 -right-6 size-36 text-primary/25"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path d="M8 112L112 8" strokeDasharray="2 10" strokeLinecap="round" />
      <rect x={70} y={70} width={26} height={26} />
      <circle cx={34} cy={34} r={12} />
      <rect
        x={16}
        y={96}
        width={30}
        height={6}
        rx={3}
        fill="currentColor"
        stroke="none"
      />
    </svg>
  )
}

function CropMarks() {
  const tick = "absolute h-3 w-3 border-primary/50"
  return (
    <div aria-hidden="true" className="pointer-events-none absolute -inset-2">
      <span className={cn(tick, "-top-0.5 -left-0.5 border-t-2 border-l-2")} />
      <span className={cn(tick, "-top-0.5 -right-0.5 border-t-2 border-r-2")} />
      <span
        className={cn(tick, "-bottom-0.5 -left-0.5 border-b-2 border-l-2")}
      />
      <span
        className={cn(tick, "-right-0.5 -bottom-0.5 border-r-2 border-b-2")}
      />
    </div>
  )
}

export default function BlogCard({ post }: { post: PostSummary }) {
  const variant = post.id % 3

  return (
    <li className="relative m-2">
      <CropMarks />
      <Link
        href={`/blog/${post.slug}`}
        className="group relative flex min-h-72 flex-col justify-end overflow-hidden border bg-card p-5 transition-colors hover:border-primary/60 sm:min-h-80 sm:p-6"
      >
        {post.coverImageUrl ? (
          <>
            <Image
              src={post.coverImageUrl}
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 640px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-background/20"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-primary/[0.07]"
            />
          </>
        ) : (
          <div aria-hidden="true" className="absolute inset-0 bg-muted/60" />
        )}

        <Doodle variant={variant} />

        <div className="relative space-y-2">
          {post.tags.length ? (
            <p className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="border border-primary/30 bg-background/70 px-1.5 py-0.5 text-[0.625rem] font-semibold tracking-widest text-primary uppercase"
                >
                  {tag}
                </span>
              ))}
            </p>
          ) : null}
          <h2 className="font-heading text-2xl leading-tight">{post.title}</h2>
          {post.excerpt ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          ) : null}
          <p className="flex items-center justify-between gap-2 pt-1 text-sm text-muted-foreground">
            <span className="truncate">
              {post.author.name}
              {post.publishedAt ? (
                <>
                  {" · "}
                  <time dateTime={post.publishedAt}>
                    {dateFormat.format(new Date(post.publishedAt))}
                  </time>
                </>
              ) : null}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold tracking-widest text-primary uppercase">
              Read
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </p>
        </div>
      </Link>
    </li>
  )
}
