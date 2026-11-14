"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import type { NameStoryData, StoryTile } from "@/lib/name-facts"
import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger)

/**
 * The result, told as three short chapters while you scroll: the
 * website address, the social usernames, what chatbots say. Each
 * chapter fills in one answer at a time, so the verdict is something
 * you watch arrive rather than a table you decode.
 *
 * Built so that the page is complete without any of the motion. The
 * server renders every chapter stacked, in full, with the final state
 * of every tile. Only when the visitor allows motion does this pin the
 * stage and play the chapters against the scroll; with reduced motion
 * or no JavaScript, the stacked version is what they read.
 */

const TILE_STATE: Record<StoryTile["state"], string> = {
  free: "border-green-600/50 text-green-800 dark:border-green-400/50 dark:text-green-400",
  taken: "border-border text-muted-foreground",
  unknown: "border-dashed text-muted-foreground",
}

function Tile({ tile }: { tile: StoryTile }) {
  return (
    <li
      data-tile
      className={cn(
        "relative flex aspect-[4/3] flex-col justify-between overflow-hidden border bg-background p-3 sm:p-4",
        TILE_STATE[tile.state]
      )}
    >
      {/* The verdict itself: fills green when free, strikes through
          when taken. This is the part that animates. */}
      {tile.state === "free" ? (
        <span
          data-fill
          aria-hidden="true"
          className="absolute inset-0 origin-bottom bg-green-600/10 dark:bg-green-400/10"
        />
      ) : null}
      {tile.state === "taken" ? (
        <span
          data-strike
          aria-hidden="true"
          className="absolute top-1/2 right-3 left-3 h-px origin-left bg-muted-foreground/70"
        />
      ) : null}
      <span className="relative font-mono text-[0.625rem] tracking-widest uppercase">
        {tile.state === "free"
          ? "Free"
          : tile.state === "taken"
            ? "Taken"
            : "Unknown"}
      </span>
      <span
        className={cn(
          "relative font-heading text-2xl leading-none break-words sm:text-3xl",
          tile.state === "taken" && "opacity-70"
        )}
      >
        {tile.label}
      </span>
    </li>
  )
}

function Chapter({
  index,
  label,
  headline,
  sub,
  children,
}: {
  index: number
  label: string
  headline: string
  sub: string
  children: React.ReactNode
}) {
  return (
    <section
      data-chapter
      aria-labelledby={`chapter-${index}`}
      className="grid items-center gap-6 border-t py-12 first:border-t-0 first:pt-0 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-14"
    >
      <div className="space-y-4">
        <p className="text-[0.6875rem] font-semibold tracking-widest text-primary uppercase">
          {index} of 3 · {label}
        </p>
        <h2
          id={`chapter-${index}`}
          className="font-heading text-4xl leading-[1.05] text-balance sm:text-5xl lg:text-6xl"
        >
          {headline}
        </h2>
        <p className="max-w-md text-muted-foreground md:text-lg">{sub}</p>
      </div>
      <div>{children}</div>
    </section>
  )
}

export default function NameStory({ story }: { story: NameStoryData }) {
  const root = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const quote = useRef<HTMLQuoteElement>(null)

  useEffect(() => {
    const el = root.current
    const stageEl = stage.current
    if (!el || !stageEl) return

    const mm = gsap.matchMedia()
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const chapters = gsap.utils.toArray<HTMLElement>("[data-chapter]", el)
      const rail = el.querySelector<HTMLElement>("[data-rail]")
      const bars = gsap.utils.toArray<HTMLElement>("[data-bar]", el)
      const quoteEl = quote.current
      const fullQuote = quoteEl?.dataset.full ?? ""
      if (chapters.length !== 3) return

      const ctx = gsap.context(() => {
        // Turn the stacked layout into one pinned stage.
        gsap.set(stageEl, { height: "calc(100svh - 9rem)", overflow: "hidden" })
        gsap.set(chapters, {
          position: "absolute",
          inset: 0,
          display: "grid",
          alignContent: "center",
          borderTopWidth: 0,
          padding: 0,
          autoAlpha: 0,
        })
        gsap.set(chapters[0], { autoAlpha: 1 })
        if (rail) gsap.set(rail, { display: "flex" })
        if (quoteEl) quoteEl.textContent = ""

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: el,
            start: "top 64px",
            end: () => `+=${Math.round(window.innerHeight * 2.4)}`,
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
          },
        })

        const sweep = (chapter: HTMLElement, at: number) => {
          const tiles = chapter.querySelectorAll("[data-tile]")
          const fills = chapter.querySelectorAll("[data-fill]")
          const strikes = chapter.querySelectorAll("[data-strike]")
          tl.from(
            tiles,
            { y: 24, autoAlpha: 0, duration: 0.5, stagger: 0.08 },
            at
          )
          tl.from(fills, { scaleY: 0, duration: 0.5, stagger: 0.1 }, at + 0.9)
          tl.from(strikes, { scaleX: 0, duration: 0.5, stagger: 0.1 }, at + 0.9)
        }

        const heading = (chapter: HTMLElement, at: number) =>
          tl.from(
            chapter.querySelectorAll("h2, h2 ~ p, p:first-child"),
            { y: 28, autoAlpha: 0, duration: 0.6, stagger: 0.08 },
            at
          )

        // Chapter one: the website address.
        heading(chapters[0], 0)
        sweep(chapters[0], 0.3)
        tl.to(bars[0], { scaleX: 1, duration: 2, ease: "none" }, 0)

        // Chapter two: the usernames.
        tl.to(chapters[0], { autoAlpha: 0, y: -24, duration: 0.5 }, 2.6)
        tl.fromTo(
          chapters[1],
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          3
        )
        sweep(chapters[1], 3.3)
        tl.to(bars[1], { scaleX: 1, duration: 2, ease: "none" }, 3)

        // Chapter three: what chatbots say, typed out as it is read.
        tl.to(chapters[1], { autoAlpha: 0, y: -24, duration: 0.5 }, 5.6)
        tl.fromTo(
          chapters[2],
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.5 },
          6
        )
        tl.from(
          chapters[2].querySelectorAll("[data-model]"),
          { y: 16, autoAlpha: 0, duration: 0.4, stagger: 0.12 },
          6.3
        )
        if (quoteEl && fullQuote) {
          const typed = { n: 0 }
          tl.to(
            typed,
            {
              n: fullQuote.length,
              duration: 1.8,
              ease: "none",
              onUpdate: () => {
                quoteEl.textContent = fullQuote.slice(0, Math.round(typed.n))
              },
            },
            6.6
          )
        }
        tl.to(bars[2], { scaleX: 1, duration: 2, ease: "none" }, 6)
        tl.to({}, { duration: 0.6 }, 8.4)
      }, el)

      return () => {
        if (quoteEl) quoteEl.textContent = fullQuote
        ctx.revert()
      }
    })
    return () => mm.revert()
  }, [])

  return (
    <div ref={root} className="px-4 py-12 md:py-0">
      <div className="mx-auto max-w-6xl">
        <div data-rail aria-hidden="true" className="hidden gap-2 pt-6 pb-4">
          {["Website address", "Usernames", "Chatbots"].map((label) => (
            <div key={label} className="flex-1 space-y-1.5">
              <div className="h-0.5 overflow-hidden bg-border">
                <div
                  data-bar
                  className="h-full origin-left scale-x-0 bg-primary"
                />
              </div>
              <p className="text-[0.625rem] font-semibold tracking-widest text-muted-foreground uppercase">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div ref={stage} className="relative">
          <Chapter
            index={1}
            label="Website address"
            headline={story.domains.headline}
            sub={story.domains.sub}
          >
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
              {story.domains.tiles.map((tile) => (
                <Tile key={tile.key} tile={tile} />
              ))}
            </ul>
          </Chapter>

          <Chapter
            index={2}
            label="Social usernames"
            headline={story.handles.headline}
            sub={story.handles.sub}
          >
            <ul className="grid grid-cols-3 gap-2 sm:gap-3">
              {story.handles.tiles.map((tile) => (
                <Tile key={tile.key} tile={tile} />
              ))}
            </ul>
          </Chapter>

          <Chapter
            index={3}
            label="What chatbots say"
            headline={story.chatbots.headline}
            sub={story.chatbots.sub}
          >
            <div className="space-y-5">
              {story.chatbots.quote ? (
                <figure className="space-y-3 border-l-2 border-primary pl-5">
                  <blockquote
                    ref={quote}
                    data-full={story.chatbots.quote.text}
                    className="font-heading text-2xl leading-snug text-balance sm:text-3xl"
                  >
                    {story.chatbots.quote.text}
                  </blockquote>
                  {story.chatbots.quote.model ? (
                    <figcaption className="text-sm text-muted-foreground">
                      {story.chatbots.quote.model}, when asked about{" "}
                      {story.name}
                    </figcaption>
                  ) : null}
                </figure>
              ) : null}
              {story.chatbots.models.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {story.chatbots.models.map((model) => (
                    <li
                      key={model}
                      data-model
                      className="border px-2.5 py-1 font-mono text-xs text-muted-foreground"
                    >
                      {model}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </Chapter>
        </div>
      </div>
    </div>
  )
}
