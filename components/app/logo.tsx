import Link from "next/link"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { LogoImage } from "@/components/app/logo-image"

type LogoProps = {
  className?: string
  href?: string
  children?: ReactNode
}

export default function Logo({
  className = "h-8 w-auto",
  href = "/",
  children,
}: LogoProps) {
  return (
    <Link href={href} className="relative inline-flex">
      <LogoImage href="/logo.png" className={cn("dark:hidden", className)} />
      <LogoImage
        href="/logo-dark.png"
        className={cn("hidden dark:block", className)}
      />
      {children}
    </Link>
  )
}
