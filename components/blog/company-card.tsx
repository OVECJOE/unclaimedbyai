"use client"

import { useRef, useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import Image from "next/image"

type CompanyMeta = {
  title: string | null
  description: string | null
  logo: string | null
  icon: string | null
}

const metaCache = new Map<string, Promise<CompanyMeta | null>>()

function normalizeDomain(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
}

function loadMeta(domain: string): Promise<CompanyMeta | null> {
  const cached = metaCache.get(domain)
  if (cached) return cached
  const request = fetch(
    `/api/blog/company-meta?domain=${encodeURIComponent(domain)}`
  )
    .then((res) => (res.ok ? (res.json() as Promise<CompanyMeta>) : null))
    .catch(() => null)
  metaCache.set(domain, request)
  return request
}

function InitialAvatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-11 shrink-0 items-center justify-center bg-primary/10 font-heading text-xl text-primary"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

export default function CompanyCard({
  name,
  domain,
}: {
  name: string
  domain: string
}) {
  const host = normalizeDomain(domain)
  const url = `https://${host}`
  const [open, setOpen] = useState(false)
  const [meta, setMeta] = useState<CompanyMeta | null>(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function ensureMeta() {
    if (meta || loading || failed) return
    setLoading(true)
    void loadMeta(host).then((result) => {
      setLoading(false)
      if (result) {
        metaCache.set(host, Promise.resolve(result))
        setMeta(result)
      } else {
        setFailed(true)
      }
    })
  }

  function scheduleOpen() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    ensureMeta()
    if (openTimer.current) clearTimeout(openTimer.current)
    openTimer.current = setTimeout(() => setOpen(true), 250)
  }

  function scheduleClose() {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }

  const logo = meta?.logo ?? meta?.icon ?? null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={scheduleOpen}
          onMouseLeave={scheduleClose}
          onFocus={ensureMeta}
          className="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
        >
          {name}
        </a>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
      >
        <div className="flex items-start gap-3 p-4">
          {logo ? (
            <Image
              src={logo}
              alt=""
              aria-hidden="true"
              loading="lazy"
              width={44}
              height={44}
              className="size-11 shrink-0 border border-primary border-dashed p-1.5 object-contain"
              onError={() =>
                setMeta((current) =>
                  current ? { ...current, logo: null, icon: null } : current
                )
              }
            />
          ) : (
            <InitialAvatar name={name} />
          )}
          <div className="min-w-0">
            <p className="font-heading text-lg leading-tight">{name}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {host}
            </p>
          </div>
        </div>
        <div className="border-t px-4 py-3">
          {loading ? (
            <div className="space-y-2" aria-label="Loading company details">
              <div className="h-3 animate-pulse bg-muted" />
              <div className="h-3 w-4/5 animate-pulse bg-muted" />
            </div>
          ) : (
            <p
              className={cn(
                "text-sm",
                !meta?.description && "text-muted-foreground"
              )}
            >
              {meta?.description ?? `No description published by ${host}.`}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
