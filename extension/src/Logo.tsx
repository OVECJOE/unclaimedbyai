import { LogoImage } from "@/components/app/logo-image"
import { SITE } from "./api"

/**
 * The site's wordmark, minus next/link: the panel is not a router, so
 * the mark opens the site in a tab instead. Same SVG, same files,
 * same light/dark swap as every header on the site.
 */
export default function Logo() {
  return (
    <a
      href={SITE}
      target="_blank"
      rel="noreferrer"
      className="relative inline-flex"
    >
      <LogoImage href="/logo.png" className="dark:hidden" />
      <LogoImage href="/logo-dark.png" className="hidden dark:block" />
    </a>
  )
}
