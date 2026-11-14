import type { Metadata } from "next"
import Link from "next/link"
import LegalDoc, { type LegalSection } from "@/components/legal/legal-doc"
import { FREE_SEARCHES, pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "The rules for using Unclaimed by AI: accounts, credits and payments, publishing idea reports, and what our checks do and don't promise.",
  path: "/terms",
})

const UPDATED = "November 14, 2026"
const EMAIL = "hello@unclaimedbyai.com"

const summary = [
  "Our checks are signals to help you decide. They are not legal advice or trademark clearance, so do a proper trademark search before you invest in a name.",
  `You start with ${FREE_SEARCHES} free searches a month, and the first check on every name is free. After that you pay with credits or a Pro subscription.`,
  "Credits never expire. They are generally not refundable once used, but if something went wrong on our side we'll make it right.",
  "Use the service for lawful naming work. Don't scrape it, attack it, or put secrets in it.",
  "Your names and checks are yours. If you publish an idea report, you're allowed to, and we can take a page down if it breaks these rules.",
  "You can leave any time by deleting your account.",
]

const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "The agreement",
    plain:
      "Using the service means you accept these terms. If you don't agree, please don't use it.",
    body: (
      <>
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) are an agreement between
          you and Unclaimed by AI (&ldquo;we&rdquo;, &ldquo;us&rdquo;) about
          your use of unclaimedbyai.com and related services (the
          &ldquo;service&rdquo;).
        </p>
        <p>
          By creating an account, checking a name or otherwise using the
          service, you agree to these Terms and to our{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: "what-we-do",
    title: "What the service does, and doesn't",
    plain:
      "We check signals about a name. We are not lawyers, and a clean check is not trademark clearance. Do your own legal checks.",
    body: (
      <>
        <p>
          The service suggests names and checks them across domain registries,
          social platforms and AI models, then scores what it finds. Scores,
          verdicts and &ldquo;available&rdquo; labels are information to help
          you decide.
        </p>
        <p>
          They are <strong>not legal advice and not trademark clearance</strong>
          . A name that shows as available can still infringe someone
          else&apos;s rights, and the data we read from registries, platforms
          and AI models can be incomplete, out of date or wrong. Before you put
          money into a brand, do your own checks, including a proper trademark
          search with a qualified lawyer where it matters.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Accounts",
    plain:
      "One account per person. Keep your email secure, and tell us if someone gets in.",
    body: (
      <>
        <p>
          You sign in with an emailed link or with Google. Give us accurate
          information, keep your email account secure, and tell us at{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a> if you think someone else got
          into your account.
        </p>
        <p>
          You&apos;re responsible for what happens under your account, and you
          must be at least 16 to use the service.
        </p>
      </>
    ),
  },
  {
    id: "credits-payments",
    title: "Credits and payments",
    plain: `You start with ${FREE_SEARCHES} free searches a month, one sandbox, and a free first check on every name. Credits buy extra searches, research and re-checks and never expire. Pro is a monthly subscription that renews until you cancel.`,
    body: (
      <>
        <p>
          After the free allowance there are two ways to pay, and they work
          independently.
        </p>
        <ul>
          <li>
            <strong>Credits</strong> are pay-as-you-go and never expire. Market
            research costs 3 credits, a search past your monthly allowance costs
            2, and re-checking a name costs 1. Pack prices are on the{" "}
            <Link href="/pricing">pricing page</Link>.
          </li>
          <li>
            <strong>Pro</strong> is a monthly subscription at the price on the
            pricing page. It renews each month until you cancel, which you can
            do yourself from the billing page. Its allowances (sandboxes,
            searches, checks per name, idea runs) reset every billing period.
          </li>
        </ul>
        <p>Some details that matter:</p>
        <ul>
          <li>
            Stripe processes payments. We never see or store card numbers.
          </li>
          <li>
            Credits belong to your account. They can&apos;t be transferred or
            exchanged for cash.
          </li>
          <li>
            Credits are used the moment a check runs, so packs are generally
            non-refundable, and we don&apos;t refund part of a Pro month when
            you cancel. If something went wrong on our side, contact us and
            we&apos;ll make it right with replacement credits or a refund.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    plain:
      "Use the checker for lawful naming work. Don't abuse, scrape or attack it.",
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>Use the service for anything unlawful or infringing.</li>
          <li>
            Scrape it, send bulk automated queries, or resell its results as
            your own checking service.
          </li>
          <li>
            Probe, attack or overload the service, or try to reach other
            people&apos;s accounts or data.
          </li>
          <li>
            Submit secrets, credentials or other sensitive data. See the Privacy
            Policy for what happens to the names you check.
          </li>
          <li>Get around credit use, rate limits or access controls.</li>
        </ul>
      </>
    ),
  },
  {
    id: "publishing",
    title: "Publishing idea reports",
    plain:
      "You can make a finished search public. You decide what it shows, you can take it down any time, and we can remove pages that break these terms.",
    body: (
      <>
        <p>
          A published idea report is a public web page built from one of your
          searches. It is always optional and nothing goes live until you
          confirm. By publishing, you tell us that:
        </p>
        <ul>
          <li>
            You wrote or have the right to share the idea description, title and
            note you publish.
          </li>
          <li>
            Nothing in it is unlawful, misleading, hateful, or about a private
            person, and it doesn&apos;t contain anyone else&apos;s personal
            information.
          </li>
          <li>
            You&apos;re happy for the page to be read by anyone, indexed by
            search engines and quoted by AI assistants.
          </li>
        </ul>
        <p>
          You give us permission to display the page, and to make it reachable
          from our own pages, such as the idea gallery and the home page. That
          permission ends when you take the page down, apart from copies other
          sites have already made.
        </p>
        <p>
          Anyone can report a page. Pages that several different people report
          are hidden automatically while we look at them, and we may take down
          or keep offline any page that breaks these Terms, with or without
          notice. A published page is a snapshot of when it was checked, so
          results on it can go out of date.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Who owns what",
    plain:
      "Our app is ours. Your names and checks are yours. We only need permission to show them back to you.",
    body: (
      <>
        <p>
          The service, including its code, design, writing and branding, belongs
          to us and is protected by intellectual-property law. We give you a
          limited, non-exclusive, non-transferable licence to use it while these
          Terms apply.
        </p>
        <p>
          The names you submit and the checks we generate for you are yours. You
          let us store, process and show them to you as part of running the
          service, and nothing more, except for pages you choose to publish (see
          above). We claim no ownership of your brand ideas.
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Other companies' services",
    plain:
      "Checks run through registries, platforms, AI providers and Stripe. Their availability and terms apply too.",
    body: (
      <p>
        We depend on outside services to run checks: domain registries, social
        platforms&apos; public pages, AI model providers, Google sign-in and
        Stripe. We don&apos;t control their uptime, accuracy or terms. If a
        registry is down or a platform limits us, the affected checks show as
        inconclusive instead of being guessed.
      </p>
    ),
  },
  {
    id: "disclaimers",
    title: "No guarantees",
    plain:
      "The service is provided as it is. We work hard on uptime and accuracy but can't promise either.",
    body: (
      <>
        <p>
          The service is provided &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo;, without warranties of any kind, express or implied,
          including about quality, fitness for a particular purpose and not
          infringing anyone&apos;s rights.
        </p>
        <p>
          We don&apos;t promise that it will always be available, that every
          check will succeed, or that results will be complete or error-free.
          Features may change or end, and we&apos;ll give reasonable notice.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Limit on our liability",
    plain:
      "If something goes wrong, what we owe you is capped at what you paid us in the last 12 months.",
    body: (
      <p>
        As far as the law allows, we aren&apos;t liable for indirect,
        incidental, consequential or punitive losses, including lost profit or
        money spent on a brand because of a check. Our total liability for any
        claim is limited to what you paid us in the 12 months before it arose,
        or $10 if you paid nothing. Some places don&apos;t allow these limits,
        so they may not apply to you.
      </p>
    ),
  },
  {
    id: "termination",
    title: "Ending your account",
    plain:
      "You can leave any time by deleting your account. We can suspend accounts that break these terms.",
    body: (
      <>
        <p>
          You can stop using the service whenever you like. Deleting your
          account (email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>) ends these
          Terms for you, except for the parts that naturally continue, such as
          money owed, ownership and the limit on liability. It also takes your
          published idea reports offline.
        </p>
        <p>
          We may suspend or close accounts that break these Terms or abuse the
          service, without notice for serious breaches. Unused credits on an
          account closed for cause are forfeited.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    plain:
      "We'll tell you about important changes before they take effect. Carrying on using the service means you accept them.",
    body: (
      <p>
        We may update these Terms as the service changes. We&apos;ll announce
        important changes by email or in the app before they take effect. If you
        keep using the service after that date you accept the new Terms. If you
        don&apos;t, stop using it and delete your account.
      </p>
    ),
  },
  {
    id: "disputes",
    title: "Disputes and governing law",
    plain:
      "Talk to us first. Most problems get sorted by email. Formal disputes follow the law of the place we're based.",
    body: (
      <>
        <p>
          If something is wrong, email us first at{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. Most issues are resolved
          quickly that way.
        </p>
        <p>
          These Terms are governed by the laws of the jurisdiction where
          Unclaimed by AI is established, ignoring its conflict-of-law rules.
          Formal proceedings go to the courts there, and you agree to them.
        </p>
      </>
    ),
  },
]

export default function TermsPage() {
  return (
    <LegalDoc
      current="terms"
      eyebrow="Legal"
      title="Terms of Service"
      lede="The rules for using Unclaimed by AI: what we promise, what you promise, and what our checks do and don't mean."
      updated={UPDATED}
      readTime="6 min"
      summary={summary}
      sections={sections}
      footerNote={
        <p className="text-sm text-muted-foreground">
          How we handle your data is covered in our{" "}
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
