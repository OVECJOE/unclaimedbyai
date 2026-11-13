import {
  InstagramIcon,
  LinkedinIcon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import Logo from "@/components/app/logo"

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/", label: "Name checker" },
      { href: "/product", label: "How checks work" },
      { href: "/pricing", label: "Pricing" },
      { href: "/product#faq", label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
      { href: "/llms.txt", label: "llms.txt" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
]

const SOCIALS = [
  {
    href: "https://x.com/UnclaimedByAI",
    label: "Unclaimed by AI on X",
    icon: NewTwitterIcon,
  },
  {
    href: "https://instagram.com/unclaimedbyai",
    label: "Unclaimed by AI on Instagram",
    icon: InstagramIcon,
  },
  {
    href: "https://linkedin.com/in/victorohachor",
    label: "Victor Ohachor on LinkedIn",
    icon: LinkedinIcon,
  },
]

export default function AppFooter() {
  return (
    // mt-10 keeps page content clear of the footer; the flex column
    // layouts above do not collapse margins, so the gap holds on every
    // page that uses this footer.
    <footer className="mt-10 overflow-hidden border-t bg-sidebar">
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-6">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div className="space-y-5">
            <Logo className="h-8 w-auto" />
            <p className="max-w-xs font-heading text-3xl leading-tight">
              Claim it before someone&apos;s{" "}
              <span className="text-primary">chatbot already has.</span>
            </p>
            <div className="-ms-3 flex items-center">
              {SOCIALS.map((social) => (
                <Link
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
                >
                  <HugeiconsIcon icon={social.icon} size="1.25rem" />
                </Link>
              ))}
            </div>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 sm:grid-cols-3"
          >
            {COLUMNS.map((column) => (
              <div key={column.title} className="space-y-4">
                <h3 className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-primary uppercase">
                  {column.title}
                </h3>
                <ul className="space-y-2.5 text-sm">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* The wordmark, set huge and hollow: a signature, not a link. */}
        <p
          aria-hidden
          className="text-outline mt-14 font-heading text-[19vw] leading-[0.8] tracking-tight select-none lg:text-[13.5rem]"
        >
          unclaimed
        </p>

        <div className="mt-6 flex flex-col gap-2 border-t pt-6 font-mono text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            &copy; {new Date().getFullYear()} Unclaimed by AI. All rights
            reserved.
          </span>
          <span>Live checks. Honest labels. Your name, your registrar.</span>
        </div>
      </div>
    </footer>
  )
}
