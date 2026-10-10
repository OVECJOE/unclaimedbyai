import type { Metadata } from "next"
import Link from "next/link"
import LegalDoc, { type LegalSection } from "@/components/legal/legal-doc"
import { pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How Unclaimed by AI collects, uses, shares, and protects your data — including what happens to the names you check.",
  path: "/privacy",
})

const UPDATED = "October 10, 2026"

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    plain:
      "We're Unclaimed by AI, the name-checking service at unclaimedbyai.com. We're the ones responsible for your data here.",
    body: (
      <>
        <p>
          Unclaimed by AI (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates the
          name-checking service at unclaimedbyai.com (the
          &ldquo;Service&rdquo;). We help founders and creators check domains,
          social handles, and AI associations before building around a name.
        </p>
        <p>
          For data-protection purposes we are the data controller for the
          personal data described in this policy. You can reach us at{" "}
          <a href="mailto:hello@unclaimedbyai.com">hello@unclaimedbyai.com</a>.
        </p>
      </>
    ),
  },
  {
    id: "data-we-collect",
    title: "Data we collect",
    plain:
      "Your email when you sign in, the names you check, your purchase history, and basic technical logs. That's the whole list.",
    body: (
      <>
        <p>We collect the minimum needed to run the Service:</p>
        <ul>
          <li>
            <strong>Account data.</strong> Your email address when you sign in
            with a magic link or Google, plus basic profile details Google
            shares (like your name) if you choose that option.
          </li>
          <li>
            <strong>Names you check.</strong> Every name, brief, search, and
            report you create, including the results we generate for you.
          </li>
          <li>
            <strong>Purchase data.</strong> Which credit packs you buy and your
            credit balance. Payments are processed by Stripe — we never see or
            store your card number.
          </li>
          <li>
            <strong>Technical data.</strong> Standard server logs (IP address,
            browser type, pages visited, timestamps) for security and debugging.
          </li>
          <li>
            <strong>Waitlist data.</strong> Your email if you join the waitlist,
            used only to notify you about launch.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use it",
    plain:
      "To run your checks, keep you signed in, take payment, and improve the service. We don't sell your data or use it for ads.",
    body: (
      <>
        <p>We use your data to:</p>
        <ul>
          <li>
            Run domain, social-handle, and AI-association checks you request.
          </li>
          <li>Create and maintain your account and sign-in sessions.</li>
          <li>Process payments and manage your credits through Stripe.</li>
          <li>
            Send transactional emails (magic links, receipts) and, rarely,
            product updates.
          </li>
          <li>
            Keep the Service secure, fix bugs, and understand aggregate usage.
          </li>
        </ul>
        <p>
          Our legal bases are performance of our contract with you, our
          legitimate interests in operating and securing the Service, and your
          consent where you give it (for example, marketing emails, which you
          can opt out of at any time).
        </p>
      </>
    ),
  },
  {
    id: "ai-checks",
    title: "What happens to the names you check",
    plain:
      "To check AI associations, we have to send the name to AI providers. Assume anything you type into the checker is shared with them.",
    body: (
      <>
        <p>
          This one deserves its own section because it surprises people. To tell
          you what AI models already associate with a name, we send that name to
          third-party AI providers (via OpenRouter) and ask what they know about
          it. Their responses become part of your report.
        </p>
        <p>
          That means{" "}
          <strong>
            every name you check is shared with AI model providers
          </strong>
          , and their own privacy policies apply to that data. Please don&apos;t
          check names containing passwords, secrets, or other sensitive
          information — the checker is for brand names you&apos;re considering,
          and you should treat anything you type as non-confidential.
        </p>
        <p>
          Domain availability is checked against public registration data
          (RDAP/WHOIS), and social handles against the platforms&apos; public
          APIs. Those queries are inherently public — a registry or platform can
          see that someone looked up that name.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    plain:
      "A handful of strictly necessary cookies to keep you signed in and remember choices, plus analytics — which only runs if you allow it. No advertising trackers.",
    body: (
      <>
        <p>We use a small, honest set of cookies:</p>
        <ul>
          <li>
            <strong>sid</strong> — your sign-in session (30 days, strictly
            necessary).
          </li>
          <li>
            <strong>tb</strong> — a one-hour marker that you&apos;ve passed our
            Cloudflare bot check, so it doesn&apos;t nag you repeatedly
            (strictly necessary).
          </li>
          <li>
            <strong>uba-consent</strong> — remembers the choice you make in the
            cookie banner for a year (strictly necessary).
          </li>
          <li>
            <strong>bid</strong> — makes sure a boost you send counts once
            (two years).
          </li>
          <li>
            <strong>uba-pending-plan</strong> — carries your selected credit
            pack through checkout (one hour, strictly necessary).
          </li>
        </ul>
        <p>
          Some pages load Cloudflare Turnstile to verify that requests come
          from humans rather than bots. We also use privacy-friendly,
          first-party analytics (no cross-site identifiers) to understand
          aggregate usage — it only loads if you allow it in the cookie
          banner, and declining it doesn&apos;t limit the Service in any way.
        </p>
        <p>
          We do not use advertising cookies or cross-site trackers. If that
          ever changes, we&apos;ll update this policy and ask for consent where
          the law requires it.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share data with",
    plain:
      "Only the processors that run the service: hosting, database, email, payments, and AI. Nobody else, and never for sale.",
    body: (
      <>
        <p>
          We share data only with the service providers that operate the
          Service, each limited to what they need:
        </p>
        <ul>
          <li>
            Cloud hosting and database providers that store and serve the app
            and your data.
          </li>
          <li>Resend (transactional email) for magic links and receipts.</li>
          <li>Stripe (payments) for checkout and billing.</li>
          <li>
            OpenRouter and AI model providers for AI-association checks, as
            described above.
          </li>
          <li>Google, only if you choose Google sign-in.</li>
        </ul>
        <p>
          We do not sell personal data, share it with advertisers, or use it for
          any purpose outside operating the Service. We may disclose data if
          required by law or to protect our rights, and we&apos;ll push back on
          overbroad requests where we can.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "Retention and deletion",
    plain:
      "We keep your data while your account is active, and you can delete your account and data at any time by emailing us.",
    body: (
      <>
        <p>
          We keep account data, searches, and reports for as long as your
          account is active, so your history is there when you return. Server
          logs are kept for a limited period for security and debugging, then
          deleted or anonymized.
        </p>
        <p>
          You can request deletion of your account and associated data at any
          time by emailing{" "}
          <a href="mailto:hello@unclaimedbyai.com">hello@unclaimedbyai.com</a>.
          We&apos;ll delete your personal data within 30 days, except where we
          must retain records for legal, tax, or fraud-prevention reasons (for
          example, payment records).
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    plain:
      "Encryption in transit and at rest, least-privilege access, and scoped credentials. No system is perfect, so tell us if you find a hole.",
    body: (
      <>
        <p>
          We protect your data with encryption in transit (TLS) and at rest,
          least-privilege access to production systems, and scoped credentials
          for third-party services. Sessions expire, magic links are single-use
          and short-lived.
        </p>
        <p>
          No system is perfectly secure. If you discover a vulnerability, please
          report it to{" "}
          <a href="mailto:hello@unclaimedbyai.com">hello@unclaimedbyai.com</a>{" "}
          and we&apos;ll respond promptly.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    plain:
      "Access, correct, export, or delete your data — just ask. EU/UK users get GDPR rights; Californians get CCPA rights.",
    body: (
      <>
        <p>
          Depending on where you live, you may have the right to access,
          correct, export, restrict, or delete your personal data, and to object
          to certain processing. To exercise any of these rights, email{" "}
          <a href="mailto:hello@unclaimedbyai.com">hello@unclaimedbyai.com</a>.
        </p>
        <p>
          If you&apos;re in the EU, UK, or Switzerland, this includes your GDPR
          rights (access, rectification, erasure, restriction, portability,
          objection) and the right to lodge a complaint with your supervisory
          authority. If you&apos;re in California, this includes your CCPA
          rights to know, delete, and opt out of sale — and to be clear, we do
          not sell personal information.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    plain:
      "The Service is for people 16 and older. We don't knowingly collect data from younger children.",
    body: (
      <p>
        The Service is not directed at children under 16, and we do not
        knowingly collect their personal data. If you believe a child has
        provided us data, contact us and we&apos;ll delete it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    plain:
      "If we change this policy in a meaningful way, we'll tell you by email or in the app before it takes effect.",
    body: (
      <p>
        We may update this policy as the Service evolves. Material changes will
        be announced by email or in-app notice before they take effect, and the
        &ldquo;last updated&rdquo; date above will always reflect the current
        version. Continued use of the Service after changes take effect means
        you accept the updated policy.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    plain:
      "Questions about privacy? Email hello@unclaimedbyai.com and a human will reply.",
    body: (
      <p>
        For any privacy question, request, or complaint, email{" "}
        <a href="mailto:hello@unclaimedbyai.com">hello@unclaimedbyai.com</a>. We
        aim to reply within a few business days.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <LegalDoc
      eyebrow="Legal · Privacy"
      title="Privacy Policy"
      lede="What we collect, why we collect it, and what happens to the names you check. Written to be read, not skimmed past."
      updated={UPDATED}
      readTime="6 min"
      sections={sections}
      footerNote={
        <p className="text-sm text-muted-foreground">
          By using Unclaimed by AI you also agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>
          , which cover accounts, credits, and acceptable use.
        </p>
      }
      next={{ href: "/terms", label: "Terms of Service" }}
    />
  )
}
