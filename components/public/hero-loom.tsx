"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { gsap } from "gsap"
import { HugeiconsIcon } from "@hugeicons/react"
import { BrandfetchIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SocialAvailabilityList } from "@/components/dashboard/social-icons"
import { aiAssociationColor, tierColor } from "@/lib/name-results"
import { agoLabel, type WildStage } from "@/lib/landing/wild-format"

/**
 * The hero's "Live from the wild" loom, fed by a real public search.
 * The drifting field, the scanning reticle, the check receipt and the
 * shortlist are pure theatre (aria-hidden), but the names and their
 * verdicts are honest: a name is haunted because a model actually links
 * it to something, and clean when nothing does. The serif title, the
 * live line, and the "Try it out" button are real, exposed content.
 *
 * GSAP owns all motion, React owns all markup. The receipt content is
 * React-rendered per scanned chip, so real domains and handles render
 * cleanly; GSAP only fades the receipt and moves the chips. Positions
 * are seeded per chip count so the static frame hydrates exactly.
 */

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A ring of resting spots around the reticle, seeded per count, clear
 *  of the center so a scanned chip always has room to land. */
function makePositions(count: number) {
  const rand = mulberry32(20261020)
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / Math.max(1, count)) * Math.PI * 2 + rand() * 0.5
    const rx = 30 + rand() * 15
    const ry = 27 + rand() * 14
    return {
      left: 50 + Math.cos(angle) * rx,
      top: 50 + Math.sin(angle) * ry,
    }
  })
}

function PillarRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-16 shrink-0 pt-0.5 text-xs text-muted-foreground">
        {label}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  )
}

/** Inert twin of the DomainChip's available/taken look: the loom's
 *  receipt is decoration, and focusable links inside aria-hidden are an
 *  accessibility trap. */
function LoomDomainChip({
  tld,
  available,
}: {
  tld: string
  available: boolean
}) {
  return (
    <span
      className={`border px-1.5 py-0.5 text-xs ${
        available
          ? "border-green-600/40 bg-green-600/10 text-green-800 dark:border-green-400/40 dark:bg-green-400/10 dark:text-green-400"
          : "border-destructive/40 bg-destructive/10 text-destructive"
      }`}
    >
      <span className="font-semibold">.{tld}</span>
    </span>
  )
}

export default function HeroLoom({ stage }: { stage: WildStage }) {
  const { query, secondsAgo, chips } = stage
  const stageRef = useRef<HTMLDivElement>(null)
  const receiptRef = useRef<HTMLDivElement>(null)
  const reticleLabelRef = useRef<HTMLSpanElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const streakRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const wrapperRefs = useRef<Array<HTMLDivElement | null>>([])
  const innerRefs = useRef<Array<HTMLDivElement | null>>([])

  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [landed, setLanded] = useState<string[]>([])

  const positions = useMemo(() => makePositions(chips.length), [chips.length])
  const active = activeIdx != null ? chips[activeIdx] : null
  const receiptChip = active ?? chips[0]

  useEffect(() => {
    const root = stageRef.current
    if (!root) return

    const mm = gsap.matchMedia()
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let io: IntersectionObserver | null = null
      let safety: number | null = null
      let pointer: ((e: PointerEvent) => void) | null = null
      const ctx = gsap.context(() => {
        const wrappers = wrapperRefs.current.filter(Boolean) as HTMLDivElement[]
        const inners = innerRefs.current.filter(Boolean) as HTMLDivElement[]
        const receipt = receiptRef.current
        const reticleLabel = reticleLabelRef.current
        const glow = glowRef.current
        const streak = streakRef.current
        const ring = ringRef.current
        if (!receipt || !reticleLabel || !glow) return

        const ORB = 420
        const slot = () => {
          const s = root.getBoundingClientRect()
          return { x: s.width * 0.5, y: s.height * 0.36 }
        }
        const toSlot = (el: HTMLDivElement) => {
          const s = root.getBoundingClientRect()
          const r = el.getBoundingClientRect()
          const target = slot()
          return {
            x:
              target.x -
              (r.left -
                s.left +
                r.width / 2 -
                (gsap.getProperty(el, "x") as number)),
            y:
              target.y -
              (r.top -
                s.top +
                r.height / 2 -
                (gsap.getProperty(el, "y") as number)),
          }
        }
        const chipCenter = (el: HTMLDivElement) => ({
          x: el.offsetLeft + el.offsetWidth / 2,
          y: el.offsetTop + el.offsetHeight / 2,
        })

        const resetBoard = () => {
          setLanded([])
          setActiveIdx(null)
          wrappers.forEach((w, i) => {
            gsap.set(w, { x: 0, y: 0, scale: 1, autoAlpha: 1, zIndex: 10 + i })
            const inner = inners[i]
            if (inner) {
              gsap.set(inner, { opacity: 1, filter: "grayscale(0)" })
              const strike = inner.querySelector("[data-strike]")
              if (strike) gsap.set(strike, { scaleX: 0 })
              const ghostBorder = inner.querySelector("[data-ghost-border]")
              if (ghostBorder) gsap.set(ghostBorder, { opacity: 0 })
            }
          })
          gsap.set(receipt, { autoAlpha: 0 })
          gsap.set(reticleLabel, { autoAlpha: 0 })
        }
        resetBoard()

        // The glow: cursor-following on desktop, parked at center
        // otherwise. It is the claiming force.
        const glowX = gsap.quickTo(glow, "x", { duration: 0.6, ease: "power3" })
        const glowY = gsap.quickTo(glow, "y", { duration: 0.6, ease: "power3" })
        const park = () => {
          const s = root.getBoundingClientRect()
          glowX(s.width / 2 - ORB / 2)
          glowY(s.height / 2 - ORB / 2)
        }
        park()
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          pointer = (e: PointerEvent) => {
            const s = root.getBoundingClientRect()
            glowX(e.clientX - s.left - ORB / 2)
            glowY(e.clientY - s.top - ORB / 2)
          }
          root.addEventListener("pointermove", pointer)
        }

        // Slow drift so the field never pulses in unison.
        const drifts = inners.map((inner, i) =>
          gsap.to(inner, {
            x: () => (mulberry32(9000 + i * 31)() - 0.5) * 34,
            y: () => (mulberry32(9100 + i * 17)() - 0.5) * 26,
            duration: 5 + (i % 5),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.4,
          })
        )
        drifts.forEach((d) => d.pause())

        // Lightning: streaks race chip to chip, flash-ring what they
        // touch. Someone is out there claiming names.
        const rand = mulberry32(777001)
        const zap = (
          from: { x: number; y: number },
          to: { x: number; y: number }
        ) => {
          if (!streak || !ring) return gsap.timeline()
          const angle =
            (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI
          const tl = gsap.timeline()
          tl.set(streak, {
            x: from.x,
            y: from.y,
            rotation: angle,
            scaleX: 0.2,
            autoAlpha: 0,
          })
            .set(ring, { x: to.x - 24, y: to.y - 24, scale: 0.4, autoAlpha: 0 })
            .to(streak, { autoAlpha: 0.9, duration: 0.05 })
            .to(streak, {
              x: to.x,
              y: to.y,
              scaleX: 1,
              duration: 0.16,
              ease: "power4.in",
            })
            .to(streak, { autoAlpha: 0, duration: 0.12 })
            .fromTo(
              ring,
              { scale: 0.4, autoAlpha: 0.9 },
              { scale: 1.9, autoAlpha: 0, duration: 0.5, ease: "power2.out" },
              ">-0.02"
            )
          const hit = wrappers.find((w) => chipCenter(w).x === to.x)
          const ghostBorder = hit?.querySelector("[data-ghost-border]")
          if (ghostBorder) {
            tl.fromTo(
              ghostBorder,
              { opacity: 0.85 },
              { opacity: 0, duration: 0.6 },
              ">-0.5"
            )
          }
          return tl
        }
        const lightning = gsap.timeline({ repeat: -1, paused: true })
        for (let hop = 0; hop < 3; hop++) {
          const a = wrappers[Math.floor(rand() * wrappers.length)]
          const b = wrappers[Math.floor(rand() * wrappers.length)]
          if (!a || !b || a === b) continue
          lightning.add(
            zap(chipCenter(a), chipCenter(b)),
            hop === 0 ? 0.4 : ">-1.6"
          )
        }
        lightning.to({}, { duration: 2.4 })

        const tl = gsap.timeline({ repeat: -1, paused: true })

        chips.forEach((chip, i) => {
          const wrapper = wrappers[i]
          const inner = inners[i]
          if (!wrapper || !inner) return
          const label = `c${i}`
          const others = wrappers.filter((_, j) => j !== i)
          const strike = inner.querySelector("[data-strike]")
          const ghostBorder = inner.querySelector("[data-ghost-border]")

          tl.addLabel(label)
            .call(() => setActiveIdx(i), [], label)
            .to(
              wrapper,
              {
                x: () => toSlot(wrapper).x,
                y: () => toSlot(wrapper).y,
                scale: 1.06,
                zIndex: 40,
                duration: 0.9,
                ease: "power3.inOut",
              },
              label
            )
            .to(others, { opacity: 0.22, duration: 0.5 }, label)
            .to(reticleLabel, { autoAlpha: 1, duration: 0.3 }, label)
            .fromTo(
              receipt,
              { autoAlpha: 0, y: 12 },
              { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" },
              `${label}+=0.55`
            )

          if (chip.ghost) {
            // The kill: strike, desaturate, let the ghost have it.
            tl.to(
              strike,
              { scaleX: 1, duration: 0.4, ease: "power2.in" },
              `${label}+=2.5`
            )
              .to(
                inner,
                { opacity: 0.4, filter: "grayscale(1)", duration: 0.5 },
                `${label}+=2.6`
              )
              .to(
                wrapper,
                { y: "+=130", autoAlpha: 0, duration: 0.9, ease: "power2.in" },
                `${label}+=3.2`
              )
              .to(receipt, { autoAlpha: 0, duration: 0.4 }, `${label}+=3.7`)
              .to(
                reticleLabel,
                { autoAlpha: 0, duration: 0.3 },
                `${label}+=3.7`
              )
          } else {
            // The survival: glow violet and snap home to the shortlist.
            tl.to(ghostBorder, { opacity: 1, duration: 0.25 }, `${label}+=1.8`)
              .to(
                wrapper,
                {
                  x: () => {
                    const s = root.getBoundingClientRect()
                    return (
                      s.width -
                      96 -
                      (wrapper.offsetLeft + wrapper.offsetWidth / 2)
                    )
                  },
                  y: () => 46 - (wrapper.offsetTop + wrapper.offsetHeight / 2),
                  scale: 0.42,
                  autoAlpha: 0,
                  duration: 0.95,
                  ease: "power3.inOut",
                },
                `${label}+=2.1`
              )
              .call(
                () => setLanded((p) => [...p, chip.name]),
                [],
                `${label}+=2.95`
              )
              .to(receipt, { autoAlpha: 0, duration: 0.4 }, `${label}+=3.2`)
              .to(
                reticleLabel,
                { autoAlpha: 0, duration: 0.3 },
                `${label}+=3.2`
              )
          }
        })

        tl.call(resetBoard, [], ">/")

        // Start once on screen; the safety timer covers environments
        // where IntersectionObserver never reports.
        let started = false
        const begin = () => {
          if (started) return
          started = true
          setLanded([])
          drifts.forEach((d) => d.play())
          lightning.play(0)
          tl.play(0)
        }
        const resume = () => {
          begin()
          tl.play()
          drifts.forEach((d) => d.play())
          lightning.play()
        }
        safety = window.setTimeout(begin, 2500)

        io = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              resume()
            } else {
              tl.pause()
              drifts.forEach((d) => d.pause())
              lightning.pause()
            }
          },
          { threshold: 0.15 }
        )
        io?.observe(root)
      }, root)
      return () => {
        io?.disconnect()
        if (safety !== null) window.clearTimeout(safety)
        if (pointer) root.removeEventListener("pointermove", pointer)
        ctx.revert()
      }
    })
    return () => mm.revert()
  }, [chips])

  if (!chips.length) return null

  return (
    <div
      ref={stageRef}
      className="relative h-[440px] overflow-hidden border border-border bg-sidebar/40 lg:h-[540px]"
    >
      {/* ── The theatre: pure decoration. ─────────────────────────── */}
      <div aria-hidden="true" className="absolute inset-0">
        {/* The claiming glow. */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 opacity-70"
          style={{ width: 420, height: 420 }}
        >
          <div className="h-full w-full rounded-full bg-[radial-gradient(circle,var(--primary)_0%,transparent_70%)] opacity-25 blur-[90px]" />
        </div>

        {/* The dashed column motif. */}
        <div className="pointer-events-none absolute inset-y-0 left-1/3 z-0 border-l border-dashed border-border" />
        <div className="pointer-events-none absolute inset-y-0 left-2/3 z-0 border-l border-dashed border-border" />

        {/* Lightning streak + arrival ring. */}
        <div
          ref={streakRef}
          className="pointer-events-none absolute top-0 left-0 z-[25] h-[3px] w-16 origin-left rounded-full bg-primary opacity-0 shadow-[0_0_18px_2px_var(--primary)]"
        />
        <div
          ref={ringRef}
          className="pointer-events-none absolute top-0 left-0 z-[25] size-12 rounded-full border-2 border-primary opacity-0"
        />

        {/* The reticle. */}
        <div className="absolute top-[36%] left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-[92px] w-[220px]">
            <span className="absolute -top-px -left-px h-3 w-3 border-t-2 border-l-2 border-primary" />
            <span className="absolute -top-px -right-px h-3 w-3 border-t-2 border-r-2 border-primary" />
            <span className="absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-primary" />
            <span className="absolute -right-px -bottom-px h-3 w-3 border-r-2 border-b-2 border-primary" />
            <span
              ref={reticleLabelRef}
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-sans text-[10px] tracking-widest whitespace-nowrap text-primary uppercase"
              style={{ opacity: 0 }}
            >
              scanning…
            </span>
          </div>
        </div>

        {/* The drifting candidate field. */}
        {chips.map((chip, i) => (
          <div
            key={chip.name}
            ref={(el) => {
              wrapperRefs.current[i] = el
            }}
            className="absolute z-10"
            style={{
              left: `${positions[i].left}%`,
              top: `${positions[i].top}%`,
            }}
          >
            <div
              ref={(el) => {
                innerRefs.current[i] = el
              }}
              className="relative border border-border bg-card px-3 py-2"
            >
              <span
                className="pointer-events-none absolute inset-0 border border-primary"
                data-ghost-border
                style={{ opacity: 0 }}
              />
              <span
                className="pointer-events-none absolute top-1/2 right-0 left-0 h-[2px] origin-left bg-foreground"
                data-strike
                style={{ transform: "scaleX(0)" }}
              />
              <span className="font-heading text-sm whitespace-nowrap">
                {chip.name}
              </span>
            </div>
          </div>
        ))}

        {/* The check receipt, wearing the dashboard's name card clothes. */}
        <div
          ref={receiptRef}
          className="absolute bottom-3 left-3 z-30 w-[340px] space-y-3 border border-border bg-card p-4"
        >
          {(() => {
            const c = receiptChip
            return (
              <>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback>
                        <HugeiconsIcon
                          icon={BrandfetchIcon}
                          className="size-4"
                        />
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {c.name}
                      </span>
                      <p className="truncate font-sans text-[10px] text-muted-foreground">
                        BRIEF: &quot;{c.query}&quot;
                      </p>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="font-medium tabular-nums">{c.score}</span>
                    <Badge className={tierColor(c.tier)}>{c.tier}</Badge>
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground italic">
                  {c.ghost ?? "no ghosts found. this name is clean"}
                </p>
                <div className="space-y-1.5">
                  <PillarRow label="Domains">
                    {c.domains.length ? (
                      <span className="flex flex-wrap gap-1.5">
                        {c.domains.slice(0, 4).map((d) => (
                          <LoomDomainChip
                            key={d.tld}
                            tld={d.tld}
                            available={d.available}
                          />
                        ))}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        none checked
                      </span>
                    )}
                  </PillarRow>
                  <PillarRow label="Handles">
                    {c.socials.length ? (
                      <SocialAvailabilityList socials={c.socials} />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        none checked
                      </span>
                    )}
                  </PillarRow>
                  <PillarRow label="AI">
                    <Badge className={aiAssociationColor(c.aiLevel)}>
                      {c.aiLevel}
                    </Badge>
                  </PillarRow>
                </div>
                <p
                  className={`border-t border-border pt-2 font-sans text-[10px] tracking-widest uppercase ${
                    c.ghost ? "text-destructive" : "text-primary"
                  }`}
                >
                  {c.ghost
                    ? "verdict: haunted, skipped"
                    : "verdict: clean, shortlisted"}
                </p>
              </>
            )
          })()}
        </div>

        {/* The shortlist wall. */}
        <div className="absolute bottom-3 right-3 z-30 w-42 border border-border bg-card/90 p-3">
          <p className="font-sans text-[10px] tracking-widest text-muted-foreground uppercase">
            Shortlist
          </p>
          <p className="font-sans text-lg font-semibold text-primary tabular-nums">
            {String(landed.length).padStart(3, "0")}
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {landed.map((name) => (
              <li
                key={name}
                className="animate-in truncate border border-primary/40 bg-primary/10 px-2 py-1 font-sans text-[10px] text-primary duration-300 zoom-in-95"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── The real content: title, live line, and the way in. ───── */}
      <div className="absolute -top-3 left-3 z-30 max-w-1/2 bg-card/75">
        <h2 className="font-heading text-lg leading-tight font-semibold">
          Live from the wild
        </h2>
        <p className="mt-1 font-sans text-xs text-muted-foreground">
          a user ran &ldquo;{query}&rdquo;, checked {agoLabel(secondsAgo)}
        </p>
      </div>
    </div>
  )
}
