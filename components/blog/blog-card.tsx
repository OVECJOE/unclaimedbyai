import Link from "next/link"
import Image from "next/image"
import { ViewTransition } from "react"
import { cn } from "@/lib/utils"
import type { PostSummary } from "@/lib/blog/types"
import { isSafeCoverUrl } from "@/lib/blog/cover-image"
import DateLabel from "./date-label"

/**
 * One post in a list. The cover sits above the words and never behind
 * them: most covers carry their own headline, and printing the title
 * over that made two layers of text fight. The cover shares a view
 * transition name with the article's cover, so opening a post carries
 * the picture into place instead of swapping pages.
 */
export function coverTransitionName(id: number): string {
  return `blog-cover-${id}`
}

export function PostMeta({
  post,
  className,
}: {
  post: Pick<PostSummary, "tags" | "readingMinutes">
  className?: string
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 text-[0.6875rem] font-semibold tracking-widest uppercase",
        className
      )}
    >
      {post.tags[0] ? (
        <>
          <span className="truncate text-primary">{post.tags[0]}</span>
          <span aria-hidden="true" className="text-muted-foreground">
            ·
          </span>
        </>
      ) : null}
      <span className="shrink-0 text-muted-foreground">
        {post.readingMinutes} min read
      </span>
    </p>
  )
}

function Cover({
  post,
  sizes,
  priority = false,
}: {
  post: PostSummary
  sizes: string
  priority?: boolean
}) {
  const hasCover = post.coverImageUrl && isSafeCoverUrl(post.coverImageUrl)
  return (
    <ViewTransition
      name={coverTransitionName(post.id)}
      share="blog-morph"
      default="none"
    >
      <div className="relative aspect-[1.91/1] overflow-hidden border bg-muted transition-colors group-hover:border-primary/60">
        {hasCover ? (
          <Image
            src={post.coverImageUrl!}
            alt=""
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <p
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center p-6 text-center font-heading text-3xl text-muted-foreground/70"
          >
            {post.title}
          </p>
        )}
      </div>
    </ViewTransition>
  )
}

export default function BlogCard({
  post,
  lead = false,
  headingLevel = "h2",
}: {
  post: PostSummary
  /** The newest post on the first page: wider, with a larger title. */
  lead?: boolean
  headingLevel?: "h2" | "h3"
}) {
  const Heading = headingLevel

  if (lead) {
    return (
      <li>
        <Link
          href={`/blog/${post.slug}`}
          className="group grid items-center gap-6 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] md:gap-10"
        >
          <Cover
            post={post}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 58vw, 740px"
          />
          <div className="space-y-4">
            <PostMeta post={post} />
            <Heading className="font-heading text-4xl leading-[1.05] text-balance underline-offset-4 decoration-primary/60 group-hover:underline md:text-5xl">
              {post.title}
            </Heading>
            {post.excerpt ? (
              <p className="line-clamp-4 text-pretty text-muted-foreground md:text-lg">
                {post.excerpt}
              </p>
            ) : null}
            <p className="text-sm text-muted-foreground">
              {post.author.name}
              {post.publishedAt ? (
                <>
                  {" · "}
                  <DateLabel value={post.publishedAt} dateStyle="long" />
                </>
              ) : null}
            </p>
          </div>
        </Link>
      </li>
    )
  }

  return (
    <li>
      <Link
        href={`/blog/${post.slug}`}
        className="group flex h-full flex-col gap-4"
      >
        <Cover
          post={post}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
        />
        <div className="flex flex-1 flex-col gap-2">
          <PostMeta post={post} />
          <Heading className="font-heading text-2xl leading-tight text-balance underline-offset-4 decoration-primary/60 group-hover:underline">
            {post.title}
          </Heading>
          {post.excerpt ? (
            <p className="line-clamp-3 text-sm text-pretty text-muted-foreground">
              {post.excerpt}
            </p>
          ) : null}
          {post.publishedAt ? (
            <p className="mt-auto pt-1 text-sm text-muted-foreground">
              <DateLabel value={post.publishedAt} />
            </p>
          ) : null}
        </div>
      </Link>
    </li>
  )
}
