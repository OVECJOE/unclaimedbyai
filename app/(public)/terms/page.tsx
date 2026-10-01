import type { Metadata } from "next"
import Link from "next/link"
import LegalDoc, { type LegalSection } from "@/components/legal/legal-doc"
import { FREE_SEARCHES, pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "The rules for using Unclaimed by AI — accounts, credits and payments, acceptable use, and what our checks do and don't promise.",
  path: "/terms",
})

const UPDATED = "October 1, 2026"

const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "The agreement",
    plain:
      "Using the service means you accept these terms. If you don't agree, don't use it.",
    body: (
      <>
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) are an agreement between
          you and Unclaimed by AI (&ldquo;we&rdquo;, &ldquo;us&rdquo;) for your
          use of unclaimedbyai.com and related services (the
          &ldquo;Service&rdquo;).
        </p>
        <p>
          By creating an account, checking a name, or otherwise using the
          Service, you agree to these Terms and to our{" "}
          <Link href="/privacy">Privacy Policy</Link>. If you don&apos;t agree,
          please don&apos;t use the Service.
        </p>
      </>
    ),
  },
  {
    id: "what-we-do",
    title: "What the Service does (and doesn't)",
    plain:
      "We check name availability signals. We are not lawyers, and a clean check is not trademark clearance — do your own legal diligence.",
    body: (
      <>
        <p>
          The Service generates name ideas and checks them across domain
          registries, social platforms, and AI models, scoring what it finds.
          Reports, scores, verdicts, and &ldquo;available&rdquo; labels are
          informational signals to help your decision-making.
        </p>
        <p>
          They are <strong>not legal advice and not trademark clearance</strong>
          . A name showing as available can still infringe someone else&apos;s
          rights, and data from registries, platforms, and AI models can be
          incomplete, stale, or wrong. Before you invest in a brand, do your own
          diligence — including a proper trademark search with qualified counsel
          where it matters.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Accounts",
    plain:
      "One account per person, keep your email secure, and tell us if someone gets in.",
    body: (
      <>
        <p>
          You sign in with an email magic link or Google. You must provide
          accurate information, keep your email account secure, and promptly
          tell us at{" "}
          <a href="mailto:hello@unclaimedbyai.com">hello@unclaimedbyai.com</a>{" "}
          if you suspect unauthorized access.
        </p>
        <p>
          One account per person. You&apos;re responsible for everything done
          under your account, and you must be at least 16 years old to use the
          Service.
        </p>
      </>
    ),
  },
  {
    id: "credits-payments",
    title: "Credits and payments",
    plain: `You start with ${FREE_SEARCHES} free searches. Extra searches and re-checks cost credits, bought as one-off packs. No subscriptions, no auto-charges.`,
    body: (
      <>
        <p>
          New accounts receive {FREE_SEARCHES} free searches, and the first
          check on every name is free. When those run out, further searches and
          re-checks consume credits, which you buy as one-off report packs.
          Current packs and prices are listed on the{" "}
          <Link href="/pricing">pricing page</Link>.
        </p>
        <ul>
          <li>
            Payments are processed by Stripe at checkout. We never see or store
            card numbers.
          </li>
          <li>
            There are no subscriptions and nothing auto-renews. You only pay
            when you choose to buy a pack.
          </li>
          <li>
            Credits are tied to your account, don&apos;t expire, and aren&apos;t
            transferable or redeemable for cash.
          </li>
          <li>
            Because credits are consumed instantly (checks run on purchase),
            packs are generally non-refundable — but if something went wrong on
            our side, contact us and we&apos;ll make it right, including with
            replacement credits or a refund.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    plain:
      "Use the checker for lawful naming work. Don't abuse, scrape, or attack it.",
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for anything unlawful or infringing.</li>
          <li>
            Scrape, bulk-query, or automate the Service outside normal use, or
            resell its outputs as your own checking service.
          </li>
          <li>
            Probe, attack, or degrade the Service, or attempt to access other
            users&apos; accounts or data.
          </li>
          <li>
            Submit names containing secrets, credentials, or other sensitive
            data (see our Privacy Policy on what happens to checked names).
          </li>
          <li>
            Circumvent credit consumption, rate limits, or access controls.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    plain:
      "Our app is ours; your names and reports are yours. We just need a license to show them back to you.",
    body: (
      <>
        <p>
          The Service — its code, design, copy, and branding — belongs to us and
          is protected by intellectual-property law. We grant you a limited,
          non-exclusive, non-transferable license to use it while these Terms
          are in effect.
        </p>
        <p>
          The names you submit and the reports we generate for you are yours.
          You grant us a license to store, process, and display them to you as
          part of operating the Service — and nothing more. We claim no
          ownership over your brand ideas.
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party services",
    plain:
      "Checks run through registries, platforms, AI providers, and Stripe. Their availability and terms apply too.",
    body: (
      <p>
        To produce reports we rely on third parties: domain registries and RDAP
        servers, social platforms&apos; public APIs, AI model providers, Google
        sign-in, and Stripe for payments. Their availability, accuracy, and
        terms are outside our control — if a registry is down or a platform
        rate-limits us, affected checks will show as inconclusive rather than
        guessed.
      </p>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    plain:
      "The service is provided as-is. We work hard on uptime and accuracy but can't guarantee either.",
    body: (
      <>
        <p>
          The Service is provided &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo;, without warranties of any kind, express or implied —
          including merchantability, fitness for a particular purpose, and
          non-infringement.
        </p>
        <p>
          We don&apos;t guarantee uninterrupted availability, that every check
          will succeed, or that results will be complete or error-free. Features
          may change or be discontinued with reasonable notice.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    plain:
      "If something goes wrong, our liability is capped at what you paid us in the last 12 months.",
    body: (
      <p>
        To the maximum extent permitted by law, we are not liable for indirect,
        incidental, consequential, or punitive damages — including lost profits
        or brand investments made in reliance on a report. Our total liability
        for any claim is capped at the amount you paid us in the 12 months
        before the claim arose (or $10 if you paid nothing). Some jurisdictions
        don&apos;t allow these limits, so they may not apply to you.
      </p>
    ),
  },
  {
    id: "termination",
    title: "Termination",
    plain:
      "You can leave anytime by deleting your account. We can suspend accounts that break these terms.",
    body: (
      <>
        <p>
          You may stop using the Service at any time; deleting your account (via
          a request to{" "}
          <a href="mailto:hello@unclaimedbyai.com">hello@unclaimedbyai.com</a>)
          terminates these Terms for you, subject to the sections that
          reasonably survive (payments owed, IP, liability limits).
        </p>
        <p>
          We may suspend or terminate accounts that violate these Terms or abuse
          the Service, with or without notice for serious violations. Unused
          credits on terminated-for-cause accounts are forfeited.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    plain:
      "We'll notify you of material changes before they take effect. Continuing to use the service means you accept them.",
    body: (
      <p>
        We may update these Terms as the Service evolves. Material changes will
        be announced by email or in-app notice before they take effect. If you
        keep using the Service after the effective date, you accept the updated
        Terms; if you don&apos;t agree, stop using the Service and delete your
        account.
      </p>
    ),
  },
  {
    id: "disputes",
    title: "Disputes and governing law",
    plain:
      "Talk to us first — most issues get resolved by email. Formal disputes follow the laws of our home jurisdiction.",
    body: (
      <>
        <p>
          If you have a dispute, contact us first at{" "}
          <a href="mailto:hello@unclaimedbyai.com">hello@unclaimedbyai.com</a> —
          most issues are resolved quickly that way.
        </p>
        <p>
          These Terms are governed by the laws of the jurisdiction in which
          Unclaimed by AI is established, without regard to conflict-of-law
          principles. Any formal proceedings will be brought in the courts of
          that jurisdiction, and you consent to their jurisdiction.
        </p>
      </>
    ),
  },
]

export default function TermsPage() {
  return (
    <LegalDoc
      eyebrow="Legal · Terms"
      title="Terms of Service"
      lede="The rules for using Unclaimed by AI — what we promise, what you promise, and what our checks do and don't mean."
      updated={UPDATED}
      readTime="7 min"
      sections={sections}
      footerNote={
        <p className="text-sm text-muted-foreground">
          How we handle your data is covered separately in our{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      }
      prev={{ href: "/privacy", label: "Privacy Policy" }}
    />
  )
}
