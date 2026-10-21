import Link from "next/link"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import TableOfContents from "@/components/legal/table-of-contents"
import { SOCIAL_PLATFORMS } from "@/lib/blog/socials"
import { extractHeadings } from "@/lib/blog/headings"
import { MdxContent } from "@/lib/blog/mdx"
import { isSafeCoverUrl } from "@/lib/blog/cover-image"
import { tagToSlug } from "@/lib/blog/tags"
import type { Post } from "@/lib/blog/types"
import DateLabel from "./date-label"

export default function PostArticle({ post }: { post: Post }) {
  // Two or more headings is the threshold for a rail worth reading;
  // a short post with a lone section is better without one.
  const headings = extractHeadings(post.bodyMdx)
  const showToc = headings.length >= 2

  return (
    <article className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <header className="space-y-3">
        <Link href="/blog" className="text-sm text-muted-foreground">
          Blog
        </Link>
        <h1 className="font-heading text-4xl font-semibold break-words md:text-5xl">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="break-words text-muted-foreground md:text-xl">
            {post.excerpt}
          </p>
        ) : null}
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {post.author.name}
          {post.publishedAt ? (
            <>
              {"·"}
              <DateLabel value={post.publishedAt} dateStyle="long" />
            </>
          ) : null}
          {post.author.socials.length ? (
            <ul className="flex items-center gap-0.5">
              {post.author.socials.map((social) => {
                const platform = SOCIAL_PLATFORMS.find(
                  (entry) => entry.value === social.platform
                )
                if (!platform) return null
                return (
                  <li key={social.platform}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer me"
                      title={`${post.author.name} on ${platform.label}`}
                      className="inline-flex min-h-9 min-w-9 items-center justify-center transition-colors hover:text-primary"
                    >
                      <HugeiconsIcon icon={platform.icon} size="1.25rem" />
                      <span className="sr-only">
                        {post.author.name} on {platform.label}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </p>
        {post.tags.length ? (
          <ul className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Link
                  href={`/blog/tag/${tagToSlug(tag)}`}
                  className="inline-block border border-primary/30 px-1.5 py-0.5 text-[0.625rem] font-semibold tracking-widest text-primary uppercase transition-colors hover:bg-primary/10"
                >
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </header>
      {post.coverImageUrl && isSafeCoverUrl(post.coverImageUrl) ? (
        post.coverImageWidth && post.coverImageHeight ? (
          <Image
            src={post.coverImageUrl}
            alt=""
            width={post.coverImageWidth}
            height={post.coverImageHeight}
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="h-auto w-full"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="h-auto w-full"
          />
        )
      ) : null}
      {showToc ? (
        <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
          <TableOfContents items={headings} />
          <div className="blog-prose min-w-0">
            <MdxContent source={post.bodyMdx} />
          </div>
        </div>
      ) : (
        <div className="blog-prose">
          <MdxContent source={post.bodyMdx} />
        </div>
      )}
    </article>
  )
}
