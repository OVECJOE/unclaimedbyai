import {
  InstagramIcon,
  LinkedinIcon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import Logo from "@/components/app/logo"

export default function AppFooter() {
  return (
    <footer className="bg-secondary/70 p-4 pt-10 dark:bg-secondary/40">
      <div className="container mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div className="space-y-3">
            <div>
              <Logo className="h-6 w-auto sm:h-8 md:h-10" />
            </div>
            <p className="font-heading text-2xl font-light sm:text-lg">
              Claim it before someone&apos;s
              <br />
              chatbot already has.
            </p>
          </div>
          <div className="grid w-full flex-1 grid-cols-3 place-content-between gap-4">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/product#faq"
                    className="transition-colors hover:text-primary"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#how-it-works"
                    className="transition-colors hover:text-primary"
                  >
                    How it works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="transition-colors hover:text-primary"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/blog"
                    className="transition-colors hover:text-primary"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="transition-colors hover:text-primary"
                  >
                    About us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="transition-colors hover:text-primary"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="transition-colors hover:text-primary"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="transition-colors hover:text-primary"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground italic sm:text-sm">
            &copy; {new Date().getFullYear()} Unclaimed by AI. All rights
            reserved.
          </span>
          <div className="inline-flex items-center gap-2">
            <Link href="https://x.com/@unclaimedbyai" target="_blank">
              <HugeiconsIcon icon={NewTwitterIcon} size="1.5rem" />
            </Link>
            <Link href="https://instagram.com/@unclaimedbyai" target="_blank">
              <HugeiconsIcon icon={InstagramIcon} size="1.5rem" />
            </Link>
            <Link href="https://linkedin.com/in/victorohachor" target="_blank">
              <HugeiconsIcon icon={LinkedinIcon} size="1.5rem" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
