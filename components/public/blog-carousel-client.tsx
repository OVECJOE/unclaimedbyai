"use client"

import Image from "next/image"
import Link from "next/link"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export type CarouselPost = {
  slug: string
  title: string
  excerpt: string
  boosts: number
  tags: string[]
  cover: string | null
  dateLabel: string
}

/**
 * The top-boosted trio on the shadcn carousel. Cards bleed slightly on
 * small screens so the swipe announces itself, and the bordered arrows
 * retire themselves the moment the track stops moving, courtesy of
 * embla's scroll state.
 */
export default function BlogCarouselClient({
  posts,
}: {
  posts: CarouselPost[]
}) {
  return (
    <section className="border-b px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-1">
          <h2 className="font-heading text-2xl font-semibold md:text-3xl">
            Popular in the field guide
          </h2>
          <p className="text-muted-foreground">
            The three posts readers boosted the most.
          </p>
        </div>

        <Carousel opts={{ align: "start", loop: false }} className="w-full">
          <CarouselContent>
            {posts.map((post) => (
              <CarouselItem
                key={post.slug}
                className="basis-[85%] sm:basis-1/2 lg:basis-1/3"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col border border-border bg-card transition-colors hover:bg-muted/40"
                >
                  <div className="relative aspect-[16/10] overflow-hidden border-b border-border">
                    {post.cover ? (
                      <Image
                        src={post.cover}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-sidebar p-6">
                        <p className="text-center font-heading text-2xl leading-snug">
                          {post.title}
                        </p>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 border border-border bg-background/90 px-2 py-1 font-mono text-[10px] tracking-widest text-primary uppercase">
                      ▲ {post.boosts} boosts
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    {post.dateLabel ? (
                      <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                        {post.dateLabel}
                      </p>
                    ) : null}
                    <h3 className="font-heading text-xl leading-snug font-semibold">
                      {post.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                    {post.tags.length ? (
                      <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-auto" />
                    )}
                    <p className="font-mono text-xs text-primary group-hover:underline">
                      read →
                    </p>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-start-2 bg-background/85 backdrop-blur-sm" />
          <CarouselNext className="-end-2 bg-background/85 backdrop-blur-sm" />
        </Carousel>
      </div>
    </section>
  )
}
