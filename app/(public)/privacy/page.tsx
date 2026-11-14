import type { Metadata } from "next"
import Link from "next/link"
import LegalDoc, { type LegalSection } from "@/components/legal/legal-doc"
import { pageMetadata } from "@/lib/site"

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "What Unclaimed by AI collects, what happens to the names you check, what becomes public, and how to delete your data.",
  path: "/privacy",
})

const UPDATED = "November 14, 2026"
const EMAIL = "hello@unclaimedbyai.com"

const summary = [
  "We collect your email when you sign in, the names you check, and what you buy. Card numbers go to Stripe and never reach us.",
  "Every name you check is sent to AI companies, because that is how we find out what chatbots think it means. Don't type anything secret.",
  "Searches you run without an account can show up on public report pages. Searches you run signed in stay private unless you publish one.",
  "Publishing an idea report is your choice. It shows your idea, your display name and the results, and you can take it down at any time.",
  "We don't sell your data, and there are no advertising trackers.",
  "You can delete your account and data whenever you like. Email us and we'll do it within 30 days.",
]

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    plain:
      "We're Unclaimed by AI, the name-checking service at unclaimedbyai.com. We're responsible for your data here.",
    body: (
      <>
        <p>
          Unclaimed by AI (&ldquo;we&rdquo;, &ldquo;us&rdquo;) runs the service
          at unclaimedbyai.com. It helps founders and creators check domains,
          social handles and AI associations before they build around a name.
        </p>
        <p>
          Under data-protection law we are the &ldquo;data controller&rdquo; for
          the personal data described here. You can reach us at{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
        </p>
      </>
    ),
  },
  {
    id: "data-we-collect",
    title: "What we collect",
    plain:
      "Your email when you sign in, the names you check, what you buy, and basic technical logs. That's the whole list.",
    body: (
      <ul>
        <li>
          <strong>Account.</strong> Your email address. If you sign in with
          Google, also the basic profile details Google shares, such as your
          name and picture.
        </li>
        <li>
          <strong>Your checks.</strong> Every name, idea description and search
          you run, with the results we produce.
        </li>
        <li>
          <strong>Purchases.</strong> Which credit packs you buy and your
          balance. Stripe takes the payment. We never see or store your card
          number.
        </li>
        <li>
          <strong>Technical logs.</strong> Your IP address, browser type, pages
          visited and times, kept for security and fixing bugs.
        </li>
        <li>
          <strong>Waitlist.</strong> Your email, if you joined a waitlist, used
          only to tell you about the launch.
        </li>
      </ul>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use it",
    plain:
      "To run your checks, keep you signed in, take payment and make the service better. Never for ads, and we don't sell it.",
    body: (
      <>
        <ul>
          <li>
            Run the domain, handle and AI checks you ask for, and keep your
            history.
          </li>
          <li>Create your account and keep you signed in.</li>
          <li>Take payment and manage your credits.</li>
          <li>
            Send the emails the service needs (sign-in links, receipts, watch
            alerts) and, rarely, product news you can opt out of.
          </li>
          <li>Keep the service secure and see how it is used overall.</li>
        </ul>
        <p>
          In legal terms we rely on three things: we need your data to deliver
          the service you signed up for, we have a legitimate interest in
          running and securing it, and for anything optional, such as marketing
          email, we ask for your consent.
        </p>
      </>
    ),
  },
  {
    id: "ai-checks",
    title: "What happens to the names you check",
    plain:
      "To learn what chatbots think a name means, we have to send the name to AI companies. Treat anything you type into the checker as not confidential.",
    body: (
      <>
        <p>
          This is the part that surprises people, so here it is plainly. We ask
          several AI models what they already associate with your name, and
          their answers become part of your results. We reach them through a
          service called OpenRouter.
        </p>
        <p>
          That means{" "}
          <strong>every name you check is shared with AI companies</strong>, and
          their own privacy policies apply to what they receive. Please
          don&apos;t type passwords, secrets or anything sensitive. The checker
          is for brand names you&apos;re considering.
        </p>
        <p>
          Domain checks use public registration records, and handle checks use
          each platform&apos;s public pages. Those lookups are public by nature,
          so a registry or platform can see that someone looked a name up.
        </p>
      </>
    ),
  },
  {
    id: "public-pages",
    title: "What becomes public",
    plain:
      "Searches run without an account can appear on public report pages. Searches run while signed in are private unless you publish one.",
    body: (
      <>
        <p>
          <strong>Searches without an account.</strong> If you check a name
          without signing in, the result is treated as a public report. Anyone
          with the link can read it, and it can appear on the site, for example
          in the &ldquo;fresh from the wild&rdquo; list on the home page. These
          reports don&apos;t show your email or any account details.
        </p>
        <p>
          <strong>Searches while signed in.</strong> Private. Only you can see
          them.
        </p>
        <p>
          <strong>Idea reports you publish.</strong> You can turn a finished
          search into a public page at <Link href="/ideas">/ideas</Link>. This
          is always your choice, and nothing is published until you confirm. The
          page shows:
        </p>
        <ul>
          <li>The idea you described and the title you chose.</li>
          <li>
            The names and their results, except any you hide. We never show
            names you hide.
          </li>
          <li>
            Your display name and, if you turn it on, your profile picture. With
            no display name set, the page says &ldquo;A founder&rdquo;.
          </li>
          <li>A note, if you write one.</li>
          <li>
            Simple facts about your account, such as when you joined and how
            many searches and names you have checked.
          </li>
        </ul>
        <p>
          Search engines and AI assistants may index a published page. You can
          take it offline from the same screen at any time. A copy may stay
          visible for a few minutes afterwards, and search engines can take
          longer to drop it. Deleting your account takes all of your pages
          offline.
        </p>
        <p>
          If you think a published page shows something it shouldn&apos;t, use
          the &ldquo;Report this page&rdquo; link at the bottom of it or email{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. Pages that enough people
          report are hidden automatically while we look at them. To tell reports
          from repeats we keep a one-way scrambled code of the reporter, not
          their address.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    plain:
      "A few cookies the site needs to work, plus analytics that only run if you allow them. No advertising trackers.",
    body: (
      <>
        <ul>
          <li>
            <strong>sid</strong>: keeps you signed in. 30 days. Needed.
          </li>
          <li>
            <strong>tb</strong>: remembers for an hour that you passed our bot
            check, so it doesn&apos;t keep asking. Needed.
          </li>
          <li>
            <strong>uba-consent</strong>: remembers your answer to the cookie
            banner for a year. Needed.
          </li>
          <li>
            <strong>uba-pending-plan</strong>: carries the credit pack you
            picked through checkout. One hour. Needed.
          </li>
          <li>
            <strong>bid</strong>: makes sure a boost you send counts once. Two
            years.
          </li>
        </ul>
        <p>
          Some pages use Cloudflare Turnstile to check that a request comes from
          a person. We also use simple first-party analytics with no cross-site
          identifiers, and it only loads if you allow it in the cookie banner.
          Saying no changes nothing about how the service works.
        </p>
        <p>
          The app also sends a few usage events to our own servers, such as
          which page you were on and that a search finished, never the text you
          typed. They set no cookies and involve no third parties.
        </p>
        <p>
          We don&apos;t use advertising cookies or cross-site trackers. If that
          ever changes, we&apos;ll update this page and ask first where the law
          requires it.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share data with",
    plain:
      "Only the companies that help run the service: hosting, email, payments and AI. Nobody else, and never for sale.",
    body: (
      <>
        <ul>
          <li>Hosting and database providers, which store the app and data.</li>
          <li>Resend, which sends sign-in links, receipts and alerts.</li>
          <li>Stripe, which handles payment.</li>
          <li>
            OpenRouter and the AI companies behind it, for the AI checks
            described above.
          </li>
          <li>Google, only if you choose Google sign-in.</li>
        </ul>
        <p>
          We don&apos;t sell personal data or share it with advertisers. We may
          disclose data if the law requires it or to protect our rights, and
          we&apos;ll push back on requests that go too far.
        </p>
      </>
    ),
  },
  {
    id: "affiliate-links",
    title: "Affiliate links",
    plain:
      "Some registrar links earn us a commission if you buy through them. It costs you the same, and it never changes what we report.",
    body: (
      <>
        <p>
          When a check shows a domain is free, some of the registrar links next
          to it are affiliate links. If you register the name through one, the
          registrar may pay us. Your price is the same either way.
        </p>
        <p>
          Two promises. A commission never changes a result: the extensions we
          show as free are the ones the check found free, whether or not that
          registrar pays us. And a link that earns us money says so. We may use
          this with Namecheap, GoDaddy and Dynadot, including the register links
          in watch-alert emails.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "Keeping and deleting your data",
    plain:
      "We keep your data while your account is open. Ask us to delete it and we will, within 30 days.",
    body: (
      <>
        <p>
          We keep your account, searches and checks while your account is
          active, so your history is there when you return. Server logs are kept
          for a limited time for security, then deleted or anonymized.
        </p>
        <p>
          To delete your account and data, email{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. We&apos;ll do it within 30
          days. We may need to keep some records, such as payments, where the
          law requires it.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    plain:
      "Encryption in transit and at rest, limited access, and sign-in links that expire. No system is perfect, so tell us if you spot a problem.",
    body: (
      <>
        <p>
          Your data is encrypted in transit (TLS) and at rest. Only the people
          and systems that need production access have it, and credentials for
          outside services are limited to what each needs. Sessions expire, and
          sign-in links work once and soon stop working.
        </p>
        <p>
          If you find a vulnerability, please email{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and we&apos;ll respond
          promptly.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    plain:
      "You can ask to see, fix, export or delete your data at any time. People in the EU, UK and California have specific legal rights too.",
    body: (
      <>
        <p>
          Depending on where you live you may be able to access, correct,
          export, restrict or delete your personal data, and to object to some
          uses of it. Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and
          we&apos;ll handle it.
        </p>
        <p>
          In the EU, UK or Switzerland this includes your GDPR rights and the
          right to complain to your data-protection authority. In California it
          includes your CCPA rights to know, delete and opt out of sale. To be
          clear, we don&apos;t sell personal information.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    plain:
      "The service is for people 16 and over. We don't knowingly collect data from younger children.",
    body: (
      <p>
        The service isn&apos;t aimed at children under 16. If you think a child
        has given us their data, tell us and we&apos;ll delete it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    plain:
      "If we change this policy in a way that matters, we'll tell you by email or in the app before it takes effect.",
    body: (
      <p>
        We may update this policy as the service changes. We&apos;ll announce
        important changes by email or in the app before they take effect, and
        the &ldquo;last updated&rdquo; date at the top always shows the current
        version. If you keep using the service after a change, you accept the
        updated policy.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    plain: `Questions about privacy? Email ${EMAIL} and a person will reply.`,
    body: (
      <p>
        For any privacy question, request or complaint, email{" "}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. We aim to reply within a few
        business days.
      </p>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <LegalDoc
      current="privacy"
      eyebrow="Legal"
      title="Privacy Policy"
      lede="What we collect, what happens to the names you check, and what becomes public. Written to be read."
      updated={UPDATED}
      readTime="5 min"
      summary={summary}
      sections={sections}
      footerNote={
        <p className="text-sm text-muted-foreground">
          By using Unclaimed by AI you also agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>
          , which cover accounts, credits and acceptable use.
        </p>
      }
      next={{ href: "/terms", label: "Terms of Service" }}
    />
  )
}
