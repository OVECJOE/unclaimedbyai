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

export const FAQS = [
  {
    id: "what-does-unclaimedbyai-check-when-i-enter-a-name",
    question: "What does UnclaimedbyAI check when I enter a name?",
    answer:
      "It runs three checks together. It looks up whether the matching domain is registered on .com, .ai, .io and .co, it checks whether the same handle is free on GitHub, npm, X and Instagram, and it asks ChatGPT, Claude and Gemini whether they already associate the name with an existing company or product. Each result comes with the evidence behind it, so you can judge the risk yourself.",
  },
  {
    id: "how-do-you-check-whether-domain-name-is-available",
    question: "How do you check whether a domain name is available?",
    answer:
      "We query the registry directly through RDAP, the protocol that replaced WHOIS for registration data, at the moment you run the check. Because the answer comes from the registry and not from a stored copy, a domain marked open was unregistered a few seconds earlier. Availability can still change before you buy, so register the domain soon after you settle on a name.",
  },
  {
    id: "are-the-social-handle-results-accurate",
    question: "Are the social handle results accurate?",
    answer:
      "GitHub and npm publish public APIs that give a definite yes or no, so those results are exact. X and Instagram offer nothing comparable, so we load the public profile page and label the result a best guess. A best guess is usually right, but confirm it on the platform itself before you commit to a handle in your branding.",
  },
  {
    id: "what-is-ai-association-check-and-why-does-it-matter-for-new-name",
    question:
      "What is an AI association check, and why does it matter for a new name?",
    answer:
      "More people now ask ChatGPT, Claude and Gemini to explain or recommend products, and an assistant that already links your name to another business can credit that business with your reviews, pricing and reputation. We ask several models what they know about the name, separately and without any hint about your idea, then show you what they associate with it. A domain search or trademark search will never surface this kind of overlap.",
  },
  {
    id: "how-reliable-is-the-ai-association-check",
    question: "How reliable is the AI association check?",
    answer:
      "It works best as an early warning. When more than one model recognizes your name as an existing brand in your category, that is a strong reason to reconsider. When none of them do, it only means they have not come across the name yet, and since models are updated regularly, a name that looks clear today could be linked to something else later.",
  },
  {
    id: "does-this-replace-trademark-search",
    question: "Does this replace a trademark search?",
    answer:
      "No. Unclaimed by AI tells you whether a name is practical to use online, across domains, social handles and AI assistants, while a trademark search tells you whether someone holds legal rights to it. Running a name here first is a quick way to rule out obvious conflicts, and the names you are serious about should then go through a trademark search or an attorney.",
  },
  {
    id: "why-does-name-show-as-taken-on-com-but-open-on-ai",
    question: "Why does a name show as taken on .com but open on .ai?",
    answer:
      "Each domain extension is run by its own registry, so availability is independent for every one of them. A name can be registered on .com for years and still be free on .ai, .io or .co, which are popular with startups. We show all four side by side so you can decide whether another extension suits your brand or whether a taken .com is a reason to pick a different name.",
  },
  {
    id: "what-should-i-do-if-my-favorite-name-is-already-taken",
    question: "What should I do if my favorite name is already taken?",
    answer:
      "Look at how it is taken before you give up on it. A name held by an active company in your category, or one that AI models already tie to that company, will cause confusion with customers and search results, so a different name is the safer choice. If the conflict is only on one domain extension or one handle, a small variation or another extension may be enough, and you can run each variation through the same checks.",
  },
  {
    id: "can-i-check-name-i-already-have-in-mind",
    question: "Can I check a name I already have in mind?",
    answer:
      "Yes. Type any name into the same box that generates suggestions and it goes through exactly the same checks as a generated one. This is useful when you are comparing a shortlist from a co-founder, deciding between a rebrand and your current name, or testing a name someone suggested before you spend money on it.",
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
    id: "is-unclaimedbyai-free-to-use",
    question: "Is UnclaimedbyAI free to use?",
    answer:
      "You can start for free: every account includes 3 searches, and the first check on every name costs nothing. After that you buy reports, which let you re-check names and run more searches, starting at $1.99 for a single report and $21.99 for 20 reports. There are no subscriptions, so you only pay when you need more.",
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
    value: "2",
    caption: "platforms verified with an exact API",
    chips: ["GitHub", "npm"],
    live: false,
  },
  {
    label: "AI models",
    value: "3",
    caption: "models asked, independently, no hints",
    chips: ["GPT", "Claude", "Gemini"],
    live: false,
  },
]
