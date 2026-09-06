import {
  InstagramIcon,
  LinkedinIcon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import Logo from "@/components/logo"

export default function AppFooter() {
  return (
    <footer className="pt-10 bg-secondary/70 p-4 dark:bg-secondary/40">
      <div className="container mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col sm:flex-row justify-between gap-8">
          <div className="space-y-3">
            <div><Logo className="h-6 sm:h-8 md:h-10 w-auto" /></div>
            <p className="text-2xl sm:text-lg font-heading font-light">
              Claim it before someone&apos;s<br />
              chatbot already has.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 flex-1 place-content-between w-full">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-primary transition-colors">How it works</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">About us</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-muted-foreground italic">
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
