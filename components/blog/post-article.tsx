import Link from "next/link"
import { MdxContent } from "@/lib/blog/mdx"
import type { Post } from "@/lib/blog/types"

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "long" })

export default function PostArticle({ post }: { post: Post }) {
  return (
    <article className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <header className="space-y-3">
        <Link href="/blog" className="text-sm text-muted-foreground">
          Blog
        </Link>
        <h1 className="font-heading text-4xl font-semibold md:text-5xl">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="text-muted-foreground md:text-xl">{post.excerpt}</p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {post.author.name}
          {post.publishedAt ? (
            <>
              {" · "}
              <time dateTime={post.publishedAt}>
                {dateFormat.format(new Date(post.publishedAt))}
              </time>
            </>
          ) : null}
        </p>
      </header>
      {post.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImageUrl} alt="" className="h-auto w-full" />
      ) : null}
      <div className="blog-prose">
        <MdxContent source={post.bodyMdx} />
      </div>
    </article>
  )
}
