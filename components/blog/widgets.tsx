import Link from "next/link"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import CompanyCard from "./company-card"

const toneClass = {
  info: "border-primary",
  tip: "border-foreground",
  warning: "border-destructive",
} as const

type Tone = keyof typeof toneClass

function Callout({
  tone = "info",
  children,
}: {
  tone?: Tone
  children?: ReactNode
}) {
  return (
    <aside
      className={cn(
        "border-s-4 bg-muted p-4 [&>p+p]:mt-3",
        toneClass[tone] ?? toneClass.info
      )}
    >
      {children}
    </aside>
  )
}

function Cta({
  heading,
  body,
  label,
  href,
}: {
  heading: string
  body?: string
  label: string
  href: string
}) {
  return (
    <div className="space-y-3 border p-6">
      <p className="font-heading text-2xl">{heading}</p>
      {body ? <p className="text-muted-foreground">{body}</p> : null}
      <Button asChild className="no-underline">
        <Link href={href}>{label}</Link>
      </Button>
    </div>
  )
}

function Figure({
  src,
  alt,
  caption,
}: {
  src: string
  alt: string
  caption?: string
}) {
  return (
    <figure>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" className="h-auto w-full" />
      {caption ? (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

function Anchor({ href = "", ...props }: ComponentPropsWithoutRef<"a">) {
  if (href.startsWith("/") || href.startsWith("#")) {
    return <Link href={href} {...props} />
  }
  return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
}

export const mdxComponents = {
  Callout,
  Cta,
  Figure,
  CompanyCard,
  a: Anchor,
}
