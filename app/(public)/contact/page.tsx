import type { Metadata } from "next"
import Link from "next/link"
import {
  Clock01Icon,
  CreditCardIcon,
  HandshakeIcon,
  LinkedinIcon,
  InstagramIcon,
  Mail01Icon,
  Megaphone01Icon,
  Message01Icon,
  NewTwitterIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Badge } from "@/components/ui/badge"
import GsapReveal from "@/components/about/gsap-reveal"
import ContactForm from "@/components/contact/contact-form"
import { JsonLd } from "@/components/app/json-ld"
import { pageMetadata, SITE_NAME, SITE_URL } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Talk to a human. Support, billing, press, privacy requests — one inbox, read by the people who build the product. We aim to reply within a few business days.",
  path: "/contact",
})

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": `${SITE_URL}/contact#contact`,
  url: `${SITE_URL}/contact`,
  name: `Contact ${SITE_NAME}`,
  description:
    "Contact Unclaimed by AI for support, billing, press, or privacy requests.",
  mainEntity: {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    email: "hello@unclaimedbyai.com",
  },
}

const CHANNELS = [
  {
    icon: Mail01Icon,
    title: "Support",
    body: "Something broke, a check looks wrong, a name won't generate. Tell us what you were doing and what you expected — specifics get faster answers.",
    meta: "Typically 1–2 business days",
  },
  {
    icon: CreditCardIcon,
    title: "Billing",
    body: "Credits missing after a purchase, a receipt you need again, or a refund question. Include the email you checked out with and we'll find the order.",
    meta: "Typically 1–2 business days",
  },
  {
    icon: Megaphone01Icon,
    title: "Press & partnerships",
    body: "Writing about name-collision in the age of AI, or have a partnership idea? We read every pitch and reply to the interesting ones.",
    meta: "We aim to reply within a few business days",
  },
  {
    icon: Shield01Icon,
    title: "Privacy requests",
    body: "Access, export, or deletion of your data — email us and we'll handle it. The full mechanics live in our privacy policy.",
    meta: "Fulfilled within 30 days",
    link: { href: "/privacy#your-rights", label: "Read your rights" },
  },
] as const

const QUICK_ANSWERS = [
  {
    icon: Message01Icon,
    question: "How does the checker actually work?",
    answer: "No black box — the whole pipeline is documented, receipts included.",
    href: "/product",
    cta: "See the product",
  },
  {
    icon: Clock01Icon,
    question: "Where's my report?",
    answer: "Signed-in users find every check under history, newest first.",
    href: "/dashboard/history",
    cta: "Open history",
  },
  {
    icon: CreditCardIcon,
    question: "How do credits and reports work?",
    answer: "One-time packs, no subscriptions. Pricing says the whole thing out loud.",
    href: "/pricing",
    cta: "See pricing",
  },
  {
    icon: HandshakeIcon,
    question: "What happens to the names I check?",
    answer:
      "Including what AI providers see — it's all in the privacy policy, written to be read.",
    href: "/privacy",
    cta: "Read privacy policy",
  },
] as const

const SOCIALS = [
  { icon: NewTwitterIcon, href: "https://x.com/@unclaimedbyai", label: "X" },
  {
    icon: InstagramIcon,
    href: "https://instagram.com/@unclaimedbyai",
    label: "Instagram",
  },
  {
    icon: LinkedinIcon,
    href: "https://linkedin.com/in/victorohachor",
    label: "LinkedIn",
  },
] as const

export default function ContactPage() {
  return (
    <>
      <JsonLd data={contactJsonLd} />

      {/* Hero */}
      <section className="space-y-5 border-b px-4 py-10 sm:text-center">
        <Badge
          className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
          asChild
        >
          <p className="px-2 py-1 sm:px-3">Contact</p>
        </Badge>
        <div className="space-y-3">
          <h1 className="mx-auto max-w-xl font-heading text-4xl font-semibold md:text-5xl">
            Talk to <span className="text-primary">a human.</span>
          </h1>
          <p className="mx-auto max-w-prose md:text-lg">
            One inbox, read by the people who build the product. No ticket
            numbers, no phone tree, no bot that says &ldquo;have you tried
            turning it off and on again&rdquo;?
          </p>
        </div>
        <p className="font-mono text-xs tracking-[0.12em] text-muted-foreground uppercase">
          hello@unclaimedbyai.com
        </p>
      </section>

      {/* Channels */}
      <section className="border-b px-4 py-10">
        <GsapReveal
          className="mx-auto grid max-w-7xl gap-px overflow-hidden border border-border bg-border sm:grid-cols-2"
          stagger={0.08}
        >
          {CHANNELS.map((channel) => (
            <article
              key={channel.title}
              data-reveal
              className="space-y-3 bg-background p-5 md:p-8"
            >
              <div className="flex items-center gap-2">
                <Badge
                  className="bg-primary/20 p-2 text-primary dark:bg-primary/30 dark:text-primary-foreground"
                  asChild
                >
                  <HugeiconsIcon icon={channel.icon} className="size-5" />
                </Badge>
                <h2 className="font-heading text-xl font-medium md:text-2xl">
                  {channel.title}
                </h2>
              </div>
              <p className="text-sm leading-6 text-muted-foreground md:text-base">
                {channel.body}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">
                  {channel.meta}
                </span>
                {"link" in channel && channel.link ? (
                  <Link
                    href={channel.link.href}
                    className="font-mono text-xs text-primary hover:underline"
                  >
                    {channel.link.label} →
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </GsapReveal>
      </section>

      {/* The form */}
      <section className="border-b px-4 py-10 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:gap-16">
          <GsapReveal className="space-y-3">
            <h2 className="font-heading text-2xl font-medium sm:text-3xl">
              Or write to us here
            </h2>
            <p className="max-w-prose text-base leading-7 sm:text-lg">
              Same inbox as the email above — this just saves you opening a
              mail app. We&apos;ll reply to the address you leave, and
              we&apos;ll never add you to a mailing list for it.
            </p>
            <ul className="space-y-2 pt-2">
              {[
                "Include the name you checked — it makes diagnosis ten minutes instead of ten emails.",
                "Screenshots of a wrong result are gold. Redact anything private.",
                "Billing questions: the email you checked out with is enough to find your order.",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-sm">
                  <span aria-hidden className="mt-1.5 size-1.5 shrink-0 bg-primary" />
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </GsapReveal>
          <GsapReveal y={32}>
            <ContactForm />
          </GsapReveal>
        </div>
      </section>

      {/* Quick answers — maybe you don't need to write at all */}
      <section className="border-b bg-primary/5 px-4 py-10 md:py-16">
        <GsapReveal className="mx-auto max-w-7xl space-y-8">
          <div className="space-y-1 sm:text-center">
            <h2 className="font-heading text-2xl font-semibold md:text-3xl">
              You might not need to write at all
            </h2>
            <p className="text-muted-foreground md:text-lg">
              The four questions we get most, answered already.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
            {QUICK_ANSWERS.map((item) => (
              <Link
                key={item.question}
                href={item.href}
                data-reveal
                className="group flex flex-col gap-2 bg-background p-5 transition-colors hover:bg-muted/50 md:p-8"
              >
                <div className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={item.icon}
                    className="size-4 text-primary"
                  />
                  <h3 className="font-heading text-lg font-medium md:text-xl">
                    {item.question}
                  </h3>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.answer}
                </p>
                <span className="font-mono text-xs text-primary">
                  {item.cta} →
                </span>
              </Link>
            ))}
          </div>
        </GsapReveal>
      </section>

      {/* Socials + closing */}
      <section className="space-y-6 px-4 py-10 sm:text-center">
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-medium sm:text-3xl">
            Not the writing type?
          </h2>
          <p className="text-muted-foreground">
            We post check teardowns and naming wreckage in public.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="border border-border bg-secondary/70 p-3 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary dark:bg-secondary/40"
            >
              <HugeiconsIcon icon={social.icon} size="1.5rem" />
            </a>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Prefer the product first?{" "}
          <Link href="/product" className="text-primary hover:underline">
            See what a check actually does
          </Link>
          .
        </p>
      </section>
    </>
  )
}
