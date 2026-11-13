import Link from "next/link"
import Image from "next/image"
import { ViewTransition } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import TableOfContents from "@/components/legal/table-of-contents"
import { FaqItem, FaqList } from "@/components/ui/faq-list"
import { SOCIAL_PLATFORMS } from "@/lib/blog/socials"
import { extractHeadings } from "@/lib/blog/headings"
import { MdxContent } from "@/lib/blog/mdx"
import { isSafeCoverUrl } from "@/lib/blog/cover-image"
import { tagToSlug } from "@/lib/blog/tags"
import type { Post } from "@/lib/blog/types"
import { cn } from "@/lib/utils"
import { coverTransitionName } from "./blog-card"
import DateLabel from "./date-label"
import ReadingProgress from "./reading-progress"
import WebsiteFavicon from "./website-favicon"

/**
 * One article, laid out for reading: a centred header, the cover a
 * little wider than the text, then a single column of about 68
 * characters a line (the comfortable 45 to 75 range typographers
 * recommend). The contents list sits in the left margin on wide
 * screens and in a bar at the bottom on phones. Pictures, code and
 * tables step out past the text on wide screens so they have room.
 */
export default function PostArticle({ post }: { post: Post }) {
  // Two or more headings is the threshold for a rail worth reading;
  // a short post with a lone section is better without one.
  const headings = extractHeadings(post.bodyMdx)
  const showToc = headings.length >= 2
  const topic = post.tags[0]

  return (
    <article>
      <ReadingProgress targetId="post-body" />

      <header className="px-4 pt-10 pb-10 md:pt-16 md:pb-12">
        <div className="mx-auto max-w-3xl space-y-6 sm:text-center">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem] sm:justify-center font-semibold tracking-widest uppercase">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
              Blog
            </Link>
            {topic ? (
              <>
                <span aria-hidden="true" className="text-muted-foreground">
                  /
                </span>
                <Link
                  href={`/blog/tag/${tagToSlug(topic)}`}
                  className="text-primary hover:underline"
                >
                  {topic}
                </Link>
              </>
            ) : null}
            <span aria-hidden="true" className="text-muted-foreground">
              ·
            </span>
            <span className="text-muted-foreground">
              {post.readingMinutes} min read
            </span>
          </p>
          <h1 className="font-heading text-4xl leading-[1.05] text-balance break-words sm:text-5xl md:text-6xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mx-auto max-w-2xl text-lg text-pretty break-words text-muted-foreground md:text-xl">
              {post.excerpt}
            </p>
          ) : null}
          <Byline post={post} />
        </div>
      </header>

      {post.coverImageUrl && isSafeCoverUrl(post.coverImageUrl) ? (
        <div className="mx-auto max-w-5xl px-4">
          <ViewTransition
            name={coverTransitionName(post.id)}
            share="blog-morph"
            default="none"
          >
            <div className="overflow-hidden border">
              {post.coverImageWidth && post.coverImageHeight ? (
                <Image
                  src={post.coverImageUrl}
                  alt=""
                  width={post.coverImageWidth}
                  height={post.coverImageHeight}
                  priority
                  sizes="(max-width: 1024px) 100vw, 992px"
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
              )}
            </div>
          </ViewTransition>
        </div>
      ) : null}

      <div
        id="post-body"
        className={cn(
          "px-4 pt-12 pb-6 md:pt-16",
          showToc
            ? "mx-auto grid max-w-7xl gap-10 lg:grid-cols-[13rem_minmax(0,42.5rem)] lg:justify-center xl:grid-cols-[minmax(0,1fr)_minmax(0,42.5rem)_minmax(0,1fr)]"
            : "mx-auto max-w-[42.5rem]"
        )}
      >
        {showToc ? (
          <div className="max-lg:contents xl:w-full xl:max-w-60 xl:justify-self-end">
            <TableOfContents items={headings} />
          </div>
        ) : null}
        <div className="min-w-0 space-y-14">
          <div className="blog-prose">
            <MdxContent source={post.bodyMdx} />
          </div>

          {post.faqs.length ? (
            <section id="faq" className="scroll-mt-24 space-y-5 border-t pt-10">
              <h2 className="font-heading text-3xl">
                Questions people actually ask
              </h2>
              <FaqList>
                {post.faqs.map((faq, index) => (
                  <FaqItem key={index} question={faq.question}>
                    <MdxContent source={faq.answer} />
                  </FaqItem>
                ))}
              </FaqList>
            </section>
          ) : null}

          {post.tags.length ? (
            <div className="space-y-3 border-t pt-6">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Filed under
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      href={`/blog/tag/${tagToSlug(tag)}`}
                      className="inline-block border border-primary/30 px-2 py-1 text-[0.6875rem] font-semibold tracking-widest text-primary uppercase transition-colors hover:bg-primary/10"
                    >
                      {tag}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function Byline({ post }: { post: Post }) {
  return (
    <div className="-ml-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground sm:ml-0 sm:justify-center">
      <p className="flex items-center gap-2.5 pl-2 sm:pl-0">
        {post.author.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.author.avatarUrl}
            alt=""
            width={32}
            height={32}
            className="size-8 border object-cover"
          />
        ) : null}
        <span>
          <span className="font-medium text-foreground">
            {post.author.name}
          </span>
          {post.publishedAt ? (
            <>
              {" · "}
              <DateLabel value={post.publishedAt} dateStyle="long" />
            </>
          ) : null}
        </span>
      </p>
      {post.author.socials.length ? (
        <ul className="flex items-center">
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
                  className="inline-flex size-9 items-center justify-center transition-colors hover:text-primary"
                >
                  {platform.value === "website" ? (
                    <WebsiteFavicon url={social.url} />
                  ) : (
                    <HugeiconsIcon icon={platform.icon} size="1.125rem" />
                  )}
                  <span className="sr-only">
                    {post.author.name} on {platform.label}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
