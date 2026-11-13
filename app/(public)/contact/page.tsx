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
import { SectionHeader } from "@/components/public/section-header"
import GsapReveal from "@/components/about/gsap-reveal"
import ContactForm from "@/components/contact/contact-form"
import LetterField from "@/components/fields/letter-field"
import { JsonLd } from "@/components/app/json-ld"
import { pageMetadata, SITE_NAME, SITE_URL } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Talk to a human. Support, billing, press, privacy requests, one inbox, read by the people who build the product. We aim to reply within a few business days.",
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
    body: "Something broke, a check looks wrong, a name won't generate. Tell us what you were doing and what you expected: specifics get faster answers.",
    meta: "Typically 1-2 business days",
  },
  {
    icon: CreditCardIcon,
    title: "Billing",
    body: "Credits missing after a purchase, a receipt you need again, or a refund question. Include the email you checked out with and we'll find the order.",
    meta: "Typically 1-2 business days",
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
    body: "Access, export, or deletion of your data, email us and we'll handle it. The full mechanics live in our privacy policy.",
    meta: "Fulfilled within 30 days",
    link: { href: "/privacy#your-rights", label: "Read your rights" },
  },
] as const

const QUICK_ANSWERS = [
  {
    icon: Message01Icon,
    question: "How does the checker actually work?",
    answer:
      "No black box: the whole pipeline is documented, receipts included.",
    href: "/product",
    cta: "See the product",
  },
  {
    icon: Clock01Icon,
    question: "Where are my checks?",
    answer: "Signed-in users find every check under history, newest first.",
    href: "/dashboard/history",
    cta: "Open history",
  },
  {
    icon: CreditCardIcon,
    question: "How do credits work?",
    answer:
      "Research costs 3, a search past your allowance 2, a re-check 1. Pro covers the rest.",
    href: "/pricing",
    cta: "See pricing",
  },
  {
    icon: HandshakeIcon,
    question: "What happens to the names I check?",
    answer:
      "Including what AI providers see: it's all in the privacy policy, written to be read.",
    href: "/privacy",
    cta: "Read privacy policy",
  },
] as const

const SOCIALS = [
  { icon: NewTwitterIcon, href: "https://x.com/unclaimedbyai", label: "X" },
  {
    icon: InstagramIcon,
    href: "https://instagram.com/unclaimedbyai",
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
      <section className="relative isolate overflow-hidden border-b px-4 pt-16 pb-14 md:pt-24">
        <LetterField quiet />
        <SectionHeader
          as="h1"
          className="mx-auto max-w-7xl"
          eyebrow="Contact"
          title="Talk to"
          accent="a human."
          lede="One inbox, read by the people who build the product. No ticket numbers, no phone tree, no bot asking if you've tried turning it off and on again."
        >
          <a
            href="mailto:hello@unclaimedbyai.com"
            data-field-avoid
            className="inline-flex border border-primary/30 bg-background px-4 py-2 font-mono text-sm text-primary transition-colors hover:bg-primary/10"
          >
            hello@unclaimedbyai.com
          </a>
        </SectionHeader>
      </section>

      {/* Channels */}
      <section className="border-b px-4 py-20 md:py-24">
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
                <span className="flex size-9 items-center justify-center border border-primary/30 bg-primary/5 text-primary">
                  <HugeiconsIcon icon={channel.icon} className="size-4" />
                </span>
                <h2 className="font-heading text-2xl md:text-3xl">
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
                    {channel.link.label}
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </GsapReveal>
      </section>

      {/* The form */}
      <section className="border-b px-4 py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:gap-20">
          <GsapReveal className="space-y-5">
            <SectionHeader
              align="start"
              eyebrow="The form"
              title="Or write to us"
              accent="right here."
              lede="Same inbox as the email above, minus the mail app. We'll reply to the address you leave, and we'll never add you to a mailing list for it."
            />
            <ul className="space-y-2 pt-2">
              {[
                "Include the name you checked. It makes diagnosis ten minutes instead of ten emails.",
                "Screenshots of a wrong result are gold. Redact anything private.",
                "Billing questions: the email you checked out with is enough to find your order.",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-sm">
                  <span
                    aria-hidden
                    className="mt-1.5 size-1.5 shrink-0 bg-primary"
                  />
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

      {/* Quick answers: maybe you don't need to write at all */}
      <section className="border-b bg-sidebar px-4 py-20 md:py-28">
        <GsapReveal className="mx-auto max-w-7xl space-y-12">
          <SectionHeader
            eyebrow="Quick answers"
            title="You might not need"
            accent="to write at all."
            lede="The four questions we get most, answered already."
          />
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
                  <h3 className="font-heading text-xl md:text-2xl">
                    {item.question}
                  </h3>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.answer}
                </p>
                <span className="font-mono text-xs text-primary">
                  {item.cta}
                </span>
              </Link>
            ))}
          </div>
        </GsapReveal>
      </section>

      {/* Socials + closing */}
      <section className="space-y-8 px-4 py-20 sm:text-center md:py-28">
        <SectionHeader
          eyebrow="Elsewhere"
          title="Not the"
          accent="writing type?"
          lede="We post check teardowns and naming wreckage in public."
        />
        <div className="flex gap-3 sm:justify-center">
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="border border-border bg-background p-4 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
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
