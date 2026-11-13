import Link from "next/link"

const LINKS = [
  { href: "/product#faq", label: "Help" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
]

/**
 * The app's footer is a strip, not a brochure: someone working in the
 * dashboard needs help and legal one click away, never a second pitch.
 */
export default function DashboardFooter() {
  return (
    <footer className="border-t px-4 py-4">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>&copy; {new Date().getFullYear()} Unclaimed by AI</span>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
