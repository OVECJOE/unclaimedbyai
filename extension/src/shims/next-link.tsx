import type { AnchorHTMLAttributes } from "react"

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
}

/**
 * next/link, minus the router — aliased in vite.config.ts so shared
 * components like DomainChip import unchanged. Every link the
 * extension renders already targets _blank, and the panel has no
 * route state to prefetch or transition.
 */
export default function Link({ href, ...rest }: LinkProps) {
  return <a href={href} {...rest} />
}
