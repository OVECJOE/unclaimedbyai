import type { ReactNode } from "react"
import { BASE_RATE, PRO_PRICE } from "@/lib/site"
import {
  GithubIcon,
  InstagramIcon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons"

export const DOMAIN_STATUSES = [
  { domain: "vantis.com", available: false },
  { domain: "vantis.ai", available: true },
  { domain: "vantis.io", available: true },
]

export const SOCIAL_HANDLES = [
  {
    icon: NewTwitterIcon,
    handle: "x.com/vantis",
    open: true,
    exact: false,
  },
  {
    icon: GithubIcon,
    handle: "github.com/vantis",
    open: false,
    exact: true,
  },
  {
    icon: InstagramIcon,
    handle: "instagram.com/vantis",
    open: true,
    exact: false,
  },
]

/**
 * The FAQ set doubles as structured data, so every entry keeps a plain
 * `answer` for the schema. Entries that deserve more than a paragraph
 * also carry a rich `body`, which is what the accordion renders: a
 * lead paragraph, optional bordered examples in mono, optional points
 * with bold lead-ins, and an optional closing line.
 */
function FaqExample({
  label,
  rows,
}: {
  label: string
  rows: [string, string][]
}) {
  return (
    <div className="mt-3 border border-dashed border-primary/30 bg-primary/5 p-3">
      <p className="mb-2 font-mono text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
        {label}
      </p>
      <div className="space-y-1 font-mono text-sm">
        {rows.map(([left, right]) => (
          <div key={left} className="flex items-center justify-between gap-4">
            <span>{left}</span>
            <span className="text-muted-foreground">{right}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FaqPoints({ points }: { points: [string, string][] }) {
  return (
    <ul className="mt-3 space-y-2">
      {points.map(([term, detail]) => (
        <li key={term} className="text-base">
          <strong>{term}.</strong> {detail}
        </li>
      ))}
    </ul>
  )
}

function FaqAnswer({ lead, children }: { lead: string; children?: ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-base leading-7">{lead}</p>
      {children}
    </div>
  )
}

export const FAQS: {
  id: string
  question: string
  answer: string
  body?: ReactNode
}[] = [
  {
    id: "what-is-unclaimedbyai",
    question: "What is UnclaimedbyAI, exactly?",
    answer:
      "A naming studio for the age of AI. Describe what you are building and it generates name ideas in a sandbox; pick one and it turns that idea into names; then it checks your shortlist across domains, social handles, and what ChatGPT, Claude and Perplexity already associate with each name. You can also skip generation and check a name you already have. Generate, check, watch: one place, from blank page to claimed name.",
    body: (
      <FaqAnswer lead="A naming studio for the age of AI. One place, from a blank page to a claimed name.">
        <p className="text-base leading-7">
          The old version of this problem had two tools: a generator that spit
          out names nobody would use, and a WHOIS lookup that told you half of
          them were taken. Neither knew what the other was for. This tool runs
          the whole path in one place.
        </p>
        <FaqPoints
          points={[
            [
              "Generate",
              "describe what you are building and a sandbox fills with name ideas, four studios arguing from different angles and a judge keeping the strongest",
            ],
            [
              "Check",
              "turn an idea into names, then check the shortlist live: domains by RDAP, handles on five platforms, and what three AI models already believe the name means",
            ],
            [
              "Watch",
              "star the names you love and Pro rechecks them every few hours, emailing you the morning something gets claimed",
            ],
          ]}
        />
        <p className="text-base leading-7">
          Already have a name in mind? Skip the generator entirely. The{" "}
          <strong>Name mode</strong> runs the same three checks on one exact
          name and hands you a shareable results page.
        </p>
      </FaqAnswer>
    ),
  },
  {
    id: "what-does-unclaimedbyai-check-when-i-enter-a-name",
    question: "What does UnclaimedbyAI check when I enter a name?",
    answer:
      "It runs three checks together. It looks up whether the matching domain is registered on .com, .ai, .io and .co, it checks whether the same handle is free on GitHub, X, Instagram, TikTok and YouTube, and it asks ChatGPT, Claude and Perplexity whether they already associate the name with an existing company or product. Each result comes with the evidence behind it, so you can judge the risk yourself.",
    body: (
      <FaqAnswer lead="Three checks, run together, in front of you. Not a score pulled out of a black box.">
        <FaqPoints
          points={[
            [
              "Domains",
              "registered or not on .com, .ai, .io and .co, answered live by the registry itself",
            ],
            [
              "Social handles",
              "free or taken on GitHub, X, Instagram, TikTok and YouTube",
            ],
            [
              "AI associations",
              "what ChatGPT, Claude and Perplexity already believe the name means, asked independently, with no hint about your idea",
            ],
          ]}
        />
        <p className="text-base leading-7">
          Every result ships with the evidence behind it, because the point is
          not a score. The point is that you can{" "}
          <strong>judge the risk yourself</strong>.
        </p>
      </FaqAnswer>
    ),
  },
  {
    id: "how-do-you-check-whether-domain-name-is-available",
    question: "How do you check whether a domain name is available?",
    answer:
      "We query the registry directly through RDAP, the protocol that replaced WHOIS for registration data, at the moment you run the check. Because the answer comes from the registry and not from a stored copy, a domain marked open was unregistered a few seconds earlier. Availability can still change before you buy, so register the domain soon after you settle on a name.",
    body: (
      <FaqAnswer lead="We ask the registry itself, at the moment you click. No cached copy, no WHOIS mirror that might be three months stale.">
        <FaqExample
          label="Live lookup, vantis.ai"
          rows={[
            ["query", "rdap.verisign.com/com/v1/domain/vantis.ai"],
            ["answer", "404 not found"],
            ["meaning", "unregistered as of a few seconds ago"],
          ]}
        />
        <p className="text-base leading-7">
          <strong>RDAP</strong> is the protocol that replaced WHOIS for
          registration data, and it is what registrars use internally. If we say
          a domain is open, it was open when we asked.
        </p>
        <p className="text-base leading-7">
          What we cannot do is hold it for you. Someone can register the name
          between our answer and your purchase, so when you settle on a name,{" "}
          <strong>buy the domain soon</strong>.
        </p>
      </FaqAnswer>
    ),
  },
  {
    id: "are-the-social-handle-results-accurate",
    question: "Are the social handle results accurate?",
    answer:
      "GitHub publishes a public API that gives a definite yes or no, so those results are exact. X, Instagram, TikTok and YouTube offer nothing comparable, so we load the public profile page and label the result a best guess. A best guess is usually right, but confirm it on the platform itself before you commit to a handle in your branding.",
    body: (
      <FaqAnswer lead="It depends on the platform, and we label which is which rather than pretending all five answers are equal.">
        <FaqExample
          label="Two kinds of answer"
          rows={[
            ["GitHub", "public API, exact yes or no"],
            ["X · Instagram · TikTok · YouTube", "live page check, best guess"],
          ]}
        />
        <p className="text-base leading-7">
          The big platforms publish nothing that gives a definite answer, so we
          load the public profile page and reason from what comes back. A best
          guess is usually right.
        </p>
        <p className="text-base leading-7">
          Where an exact answer does not exist,{" "}
          <strong>we say so on the card</strong> instead of faking a green
          checkmark. Confirm the handle on the platform itself before you print
          it on anything.
        </p>
      </FaqAnswer>
    ),
  },
  {
    id: "what-is-ai-association-check-and-why-does-it-matter-for-new-name",
    question:
      "What is an AI association check, and why does it matter for a new name?",
    answer:
      "More people now ask ChatGPT, Claude and Perplexity to explain or recommend products, and an assistant that already links your name to another business can credit that business with your reviews, pricing and reputation. We ask several models what they know about the name, separately and without any hint about your idea, then show you what they associate with it. A domain search or trademark search will never surface this kind of overlap.",
    body: (
      <FaqAnswer lead="This is the check no domain search will ever catch, and it is the reason this site exists.">
        <p className="text-base leading-7">
          <strong>900 million people</strong> ask ChatGPT something every week.
          When someone asks about your category, the assistant answers from what
          it already associates with names in that space. If your name is
          already tied to a different business, the model will describe{" "}
          <em>that</em> business when asked about yours. Your reviews, your
          pricing, your reputation, all credited to someone else.
        </p>
        <p className="text-base leading-7">
          So we ask the models directly. Three of them, separately, with{" "}
          <strong>no hint about your idea</strong>, so the answer cannot be
          coached. A domain search or trademark search will never surface this
          overlap, because it is not a legal question. It is a question about
          what a machine already believes.
        </p>
      </FaqAnswer>
    ),
  },
  {
    id: "how-reliable-is-the-ai-association-check",
    question: "How reliable is the AI association check?",
    answer:
      "It works best as an early warning. When more than one model recognizes your name as an existing brand in your category, that is a strong reason to reconsider. When none of them do, it only means they have not come across the name yet, and since models are updated regularly, a name that looks clear today could be linked to something else later.",
    body: (
      <FaqAnswer lead="Treat it as an early warning system, not a verdict. And read it asymmetrically.">
        <FaqPoints
          points={[
            [
              "Multiple models recognize the name",
              "strong signal. That is a real brand with real presence, and you should probably pick a different name",
            ],
            [
              "No model recognizes it",
              "weak signal. It means they have not come across the name yet, which is not the same as nobody owning it",
            ],
          ]}
        />
        <p className="text-base leading-7">
          Models get updated regularly, so a name that looks clear today could
          be linked to something else later. That is another reason the
          watchlist exists.
        </p>
      </FaqAnswer>
    ),
  },
  {
    id: "does-this-replace-trademark-search",
    question: "Does this replace a trademark search?",
    answer:
      "No. Unclaimed by AI tells you whether a name is practical to use online, across domains, social handles and AI assistants, while a trademark search tells you whether someone holds legal rights to it. Running a name here first is a quick way to rule out obvious conflicts, and the names you are serious about should then go through a trademark search or an attorney.",
    body: (
      <FaqAnswer lead="No, and anyone who tells you otherwise is selling something.">
        <FaqPoints
          points={[
            [
              "What we check",
              "whether the name is practical to use online: domains, handles, and what the AI models already associate with it",
            ],
            [
              "What a trademark search checks",
              "whether someone holds legal rights to the name, in a specific jurisdiction and class of commerce",
            ],
          ]}
        />
        <p className="text-base leading-7">
          Run a name here first. It is a fast way to rule out the obvious
          conflicts. Then the names you are serious about go through a trademark
          search or an attorney, because that is a different question with
          different consequences.
        </p>
      </FaqAnswer>
    ),
  },
  {
    id: "why-does-name-show-as-taken-on-com-but-open-on-ai",
    question: "Why does a name show as taken on .com but open on .ai?",
    answer:
      "Each domain extension is run by its own registry, so availability is independent for every one of them. A name can be registered on .com for years and still be free on .ai, .io or .co, which are popular with startups. We show all four side by side so you can decide whether another extension suits your brand or whether a taken .com is a reason to pick a different name.",
    body: (
      <FaqAnswer lead="Each extension is its own registry, so availability is independent per extension. There is no single global yes or no.">
        <FaqExample
          label="One name, three answers"
          rows={[
            ["vantis.com", "taken, registered years ago"],
            ["vantis.ai", "open"],
            ["vantis.io", "open"],
          ]}
        />
        <p className="text-base leading-7">
          A name can sit registered on .com for a decade and still be free on{" "}
          <strong>.ai, .io and .co</strong>, the extensions startups actually
          reach for. We show all four side by side so you can decide whether
          another extension suits the brand or whether the taken .com is a
          reason to pick a different name.
        </p>
      </FaqAnswer>
    ),
  },
  {
    id: "can-i-buy-the-domain-through-you",
    question: "Can I buy the domain through you?",
    answer:
      "We don't sell domains, so no. What we do is tell you it's open, then hand you a link to a registrar that does: Namecheap, GoDaddy, or Dynadot. Some of those links earn us a commission at no extra cost to you, and we label them when they appear. The check is the product; the registration is yours to finish, at the registrar, in your own name.",
    body: (
      <FaqAnswer lead="We don't sell domains, so no. What we do is tell you it's open, then hand you a registrar that does.">
        <p className="text-base leading-7">
          A domain check and a domain purchase are two different businesses.
          Ours is the check: live RDAP lookups, five platforms of handles, three
          AI models, all in front of you with the receipts. The purchase is a
          registrar&apos;s job, and it should stay that way.
        </p>
        <p className="text-base leading-7">
          So when a name comes back open, we hand you a link to{" "}
          <strong>Namecheap, GoDaddy, or Dynadot</strong>, and you finish there,
          in your own name, at their price. Some of those links earn us a
          commission at no extra cost to you, and we label them when they
          appear.
        </p>
        <p className="text-base leading-7">
          We say this plainly because the alternative is a middleman who marks
          up a domain and calls it convenience.{" "}
          <strong>The check is the product.</strong> The registration is yours
          to finish, and it should be in your name, not ours.
        </p>
      </FaqAnswer>
    ),
  },
  {
    id: "what-should-i-do-if-my-favorite-name-is-already-taken",
    question: "What should I do if my favorite name is already taken?",
    answer:
      "Look at how it is taken before you give up on it. A name held by an active company in your category, or one that AI models already tie to that company, will cause confusion with customers and search results, so a different name is the safer choice. If the conflict is only on one domain extension or one handle, a small variation or another extension may be enough, and you can run each variation through the same checks.",
    body: (
      <FaqAnswer lead="Before you grieve, look at how it is taken. Not every conflict is equal.">
        <FaqPoints
          points={[
            [
              "Active company in your category",
              "confusion with customers and search results. A different name is the safer choice",
            ],
            [
              "Only one extension or one handle conflicts",
              "a variation or another extension may be enough, and each variation goes through the same three checks in under a minute",
            ],
            [
              "Sitting dormant with no use",
              "a legal question, not a technical one. This tool will not tell you whether you can take it, and no honest tool can",
            ],
          ]}
        />
      </FaqAnswer>
    ),
  },
  {
    id: "can-i-check-name-i-already-have-in-mind",
    question: "Can I check a name I already have in mind?",
    answer:
      "Yes. Switch the prompter from Idea to Name, type the exact name, and it goes through the same three checks without the generation step, landing on a shareable results page. This is useful when you are comparing a shortlist from a co-founder, deciding between a rebrand and your current name, or testing a name someone suggested before you spend money on it.",
    body: (
      <FaqAnswer lead="Yes, and you never have to generate anything to do it.">
        <p className="text-base leading-7">
          Switch the prompter from <strong>Idea</strong> to{" "}
          <strong>Name</strong>, type the exact name, and it runs the same three
          checks without the generation step, landing on a results page you can
          share with whoever is arguing with you about this.
        </p>
        <p className="text-base leading-7">
          Useful when you are comparing a shortlist from a co-founder, deciding
          between a rebrand and your current name, or testing the name someone
          suggested at dinner before you spend money on it.
        </p>
      </FaqAnswer>
    ),
  },
  {
    id: "can-i-keep-watching-a-name-after-i-check-it",
    question: "Can I keep watching a name after I check it?",
    answer:
      "Yes, on Pro. Star any name in your results and it joins your watchlist, where we recheck its domains and handles every few hours and email you the moment something gets claimed. The streak on each card shows how long a name has stayed untouched, and watching saves you from manually re-running checks while you are still deciding.",
    body: (
      <FaqAnswer lead="Yes, on Pro. Star a name and it goes on the watchlist, where we recheck it every few hours.">
        <p className="text-base leading-7">
          Domains get registered while you sleep. Handles get claimed during
          your commute. The watchlist is how a name you love stops being a
          screenshot you forgot and becomes something that emails you the
          morning it changes.
        </p>
        <p className="text-base leading-7">
          The streak on each card shows how long a name has stayed untouched,
          and watching saves you from manually re-running checks while you are
          still deciding.
        </p>
      </FaqAnswer>
    ),
  },
  {
    id: "what-kinds-of-names-can-i-check",
    question: "What kinds of names can I check?",
    answer:
      "Anything you plan to put in front of customers, including a company name, a product, a feature, a service, a newsletter or content series, a marketing campaign or an internal process. The checks are the same for each, and the category you pick helps the AI association check judge whether a similar name is a real conflict in your space.",
  },
  {
    id: "why-would-i-check-the-same-name-more-than-once",
    question: "Why would I check the same name more than once?",
    answer:
      "Domains get registered and handles get claimed every day, so a result that was clear last week may have changed by the time you are ready to commit. Running a final check just before you register the domain or announce the name gives you fresh results from every source, and a re-check repeats all three checks from scratch.",
  },
  {
    id: "what-is-a-sandbox",
    question: "What exactly is a sandbox?",
    answer:
      "A sandbox is a collection of ideas, in the same way a search is a collection of names. Describe what you are building, and it becomes the room where that brief's names get generated, researched and turned into searches. Each sandbox carries its own steer, so a weekend baking idea and a serious invoicing idea never share the same eight answers.",
    body: (
      <FaqAnswer lead="A sandbox is a collection of ideas, the way a search is a collection of names.">
        <p className="text-base leading-7">
          Describe what you are building, and the sandbox becomes the room where
          that brief&apos;s names get generated, researched and turned into
          searches. Everything about the project stays in one place instead of
          scattered across a history list.
        </p>
        <p className="text-base leading-7">
          Each sandbox carries its own <strong>steer</strong>, the eight answers
          about your skills, time, budget and audience that shape generation. A
          weekend baking idea and a serious invoicing idea never have to share
          the same steer, and you can override any answer for one sandbox
          without touching the account default.
        </p>
      </FaqAnswer>
    ),
  },
  {
    id: "how-does-idea-generation-actually-work",
    question: "How does the name generation actually work?",
    answer:
      "Four studios generate from different angles at once, then a judge keeps the strongest names and drops the duplicates. You pick how many ideas a run yields, from four to eight, and can steer a run with a seed phrase. Free accounts get three runs a day. The point is spread, not volume: one model in one mood produces one flavor of name, and a list of forty names from one mood is forty versions of the same idea.",
    body: (
      <FaqAnswer lead="Four studios argue from different angles, and a judge keeps the strongest. You never see the argument, only the shortlist.">
        <FaqExample
          label="One run"
          rows={[
            ["studios", "4, each with a different naming strategy"],
            ["ideas per run", "you pick, 4 to 8"],
            ["judge", "keeps the strongest, drops duplicates"],
            ["free allowance", "3 runs a day, refilled by the clock"],
          ]}
        />
        <p className="text-base leading-7">
          Why not one model and forty names? Because{" "}
          <strong>one model in one mood produces one flavor of name</strong>. A
          list of forty from a single perspective is forty versions of the same
          idea. Four perspectives produce a range you can actually choose
          within.
        </p>
        <p className="text-base leading-7">
          You can also steer a run with a seed, a phrase like &quot;something in
          fintech&quot;, and the studios bend toward it without narrowing to it.
        </p>
      </FaqAnswer>
    ),
  },
  {
    id: "what-do-i-get-from-market-research",
    question: "What do I get from a market research report?",
    answer:
      "A paid, per-idea artifact for three credits: who else plays in the space and how crowded it is, whether people are searching for this and the trend, where the buyers are and how to reach them, and how the idea earns money with rough price points. It is one-shot with a paid refresh: a new purchase creates a new version and keeps the old one readable, and a failed research is refunded automatically.",
    body: (
      <FaqAnswer lead="Four sections, bought per idea, written by the same models that generate the names with a research brief.">
        <FaqPoints
          points={[
            ["Competitors", "who else plays here, and how crowded it is"],
            ["Demand", "whether people are searching for this, and the trend"],
            [
              "Audience channels",
              "where the buyers already are and how to reach them",
            ],
            [
              "Monetization",
              "how the idea earns money, with rough price points",
            ],
          ]}
        />
        <p className="text-base leading-7">
          It is <strong>one-shot with a paid refresh</strong>: a new purchase
          creates a new version and keeps the old one readable, so the history
          of what you paid for survives. If research fails to generate, the
          credits come back automatically. No ticket, no email.
        </p>
      </FaqAnswer>
    ),
  },
  {
    id: "how-do-credits-work",
    question: "How do credits work?",
    answer:
      `Credits are the pay-as-you-go layer on top of the free plan. Research costs 3, a search past your monthly allowance costs 2, and re-checking a name costs 1. The first check on every name is always free. Credits never expire, cost $${BASE_RATE.toFixed(2)} each at the single rate and less in packs, and they only buy those three things: research, searches and re-checks.`,
    body: (
      <FaqAnswer lead="Credits are the pay-as-you-go layer on top of the free plan. Three things cost them, and nothing else does.">
        <FaqExample
          label="What things cost"
          rows={[
            ["market research", "3 credits"],
            ["search (past allowance)", "2 credits"],
            ["re-check a name", "1 credit"],
            ["first check, every name", "free, always"],
          ]}
        />
        <p className="text-base leading-7">
          They cost <strong>
            {"$"}
            {BASE_RATE.toFixed(2)} each
          </strong>
          at the single rate and less in
          packs, they never expire, and they only buy those three things. The
          monthly search allowance on your plan always spends first; credits
          pick up when it runs dry, so running out of plan never blocks you.
        </p>
      </FaqAnswer>
    ),
  },
  {
    id: "is-unclaimedbyai-free-to-use",
    question: "Is UnclaimedbyAI free to use?",
    answer:
      `Yes, and the free tier is a real product, not a demo. Every account starts with one sandbox, three searches a month, three idea runs a day, and the first check on every name costs nothing. When you need more, credits buy research, searches and re-checks without a subscription, and Pro at $${PRO_PRICE} a month is for people who live in the tool: ten sandboxes, fifty searches, five checks per name, twenty idea runs a day, and the watchlist.`,
    body: (
      <FaqAnswer lead="Yes, and the free tier is a real product, not a demo that ends at the good part.">
        <FaqExample
          label="Free, from day one"
          rows={[
            ["sandbox", "1"],
            ["searches", "3 a month"],
            ["idea runs", "3 a day"],
            ["first check, every name", "free, always"],
            ["card required", "no"],
          ]}
        />
        <p className="text-base leading-7">
          When you need more than that, <strong>credits</strong> buy research,
          extra searches and re-checks with no subscription attached. And{" "}
          <strong>
            Pro, at {"$"}
            {PRO_PRICE} a month
          </strong>
          , is for people who live in the
          tool: ten sandboxes, fifty searches a month, five checks per name,
          twenty idea runs a day, and the watchlist.
        </p>
        <p className="text-base leading-7">
          The distinction is simple. Credits are for occasional depth. Pro is
          for when naming stops being a one-weekend problem and becomes part of
          how you work.
        </p>
      </FaqAnswer>
    ),
  },
  {
    id: "do-you-train-on-my-ideas-or-briefs",
    question: "Do you train on my ideas or briefs?",
    answer:
      "No. Your briefs and ideas are yours. Generation and research run through third-party model providers, so the text you type is sent to them to answer the request, which the privacy policy states plainly. We do not use your content to train models, and the providers we use do not train on API traffic by default.",
    body: (
      <FaqAnswer lead="No. Your briefs and ideas are yours, and we do not train models on them.">
        <p className="text-base leading-7">
          To generate names and research, your text is sent to third-party model
          providers, because that is where the models live. That is a
          <strong> request</strong>, not training data, and the privacy policy
          states it plainly rather than burying it.
        </p>
        <p className="text-base leading-7">
          The same honesty applies to the checks: to tell you what AI models
          associate with a name, the name has to be sent to AI providers. Type
          brand names here, not passwords.
        </p>
      </FaqAnswer>
    ),
  },
  {
    id: "what-happens-to-my-work-if-i-stop-paying",
    question: "What happens to my work if I stop paying for Pro?",
    answer:
      "It stays yours. Your sandboxes, ideas, searches and check history all survive; you drop to the free tier's limits, which means one sandbox and the monthly free search allowance. Nothing is deleted and nothing is held hostage. Buy credits or re-subscribe and the same account picks up where it left off.",
    body: (
      <FaqAnswer lead="It stays yours. Nothing is deleted and nothing is held hostage.">
        <p className="text-base leading-7">
          Your sandboxes, ideas, searches and check history all survive the
          downgrade. You drop to the free tier&apos;s limits: one sandbox and
          the monthly free search allowance. The rest of your work is still
          there, readable.
        </p>
        <p className="text-base leading-7">
          Buy credits or re-subscribe later and the{" "}
          <strong>same account picks up where it left off</strong>. Naming is a
          project you return to, not a treadmill, and the tool should behave
          that way.
        </p>
      </FaqAnswer>
    ),
  },
]

export const PROOF_POINTS = [
  {
    label: "Domains",
    value: "4",
    caption: "registries checked live, by RDAP",
    chips: [".com", ".ai", ".io", ".co"],
    live: true,
  },
  {
    label: "Handles",
    value: "5",
    caption: "platforms checked live, GitHub verified exactly",
    chips: ["GitHub", "X", "Instagram", "TikTok", "YouTube"],
    live: false,
  },
  {
    label: "AI models",
    value: "3",
    caption: "models asked, independently, no hints",
    chips: ["GPT", "Claude", "Perplexity"],
    live: false,
  },
]
