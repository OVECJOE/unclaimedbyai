import GsapReveal from "@/components/about/gsap-reveal"

/**
 * The three checks, shown as what they actually return instead of icons
 * with captions. Server-rendered mono blocks: the evidence is the
 * design. Every value here mirrors a real response shape, which is the
 * same trick the product page's feature rows pull at larger size.
 */

function ReceiptFrame({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string
  title: string
  body: string
  children: React.ReactNode
}) {
  return (
    <article
      data-reveal
      className="flex flex-col gap-4 bg-background p-5 sm:p-6"
    >
      <div className="space-y-1">
        <p className="font-mono text-[0.625rem] font-semibold tracking-[0.12em] text-primary uppercase">
          {eyebrow}
        </p>
        <h3 className="font-heading text-xl font-semibold sm:text-2xl">
          {title}
        </h3>
      </div>
      <div className="flex-1 border border-dashed border-primary/30 bg-primary/5 p-4 font-mono text-sm">
        {children}
      </div>
      <p className="text-sm text-muted-foreground">{body}</p>
    </article>
  )
}

function ReceiptRow({
  left,
  right,
  tone = "muted",
}: {
  left: string
  right: string
  tone?: "muted" | "open" | "taken" | "warn"
}) {
  const toneClass =
    tone === "open"
      ? "text-green-700 dark:text-green-500"
      : tone === "taken"
        ? "text-red-700 dark:text-red-500"
        : tone === "warn"
          ? "text-amber-600 dark:text-amber-500"
          : "text-muted-foreground"
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="truncate">{left}</span>
      <span className={toneClass}>{right}</span>
    </div>
  )
}

/**
 * The three checks as receipts: what each one actually returns, in the
 * shape it returns it. Replaces the icon-caption grid with evidence.
 */
export default function ChecksReceipts() {
  return (
    <section className="border-b px-4 py-10 md:py-16">
      <GsapReveal className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2 sm:text-center">
          <p className="text-[0.625rem] font-semibold tracking-widest text-primary uppercase">
            The three checks
          </p>
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl md:text-4xl">
            Not a score. <span className="text-primary">The receipts.</span>
          </h2>
          <p className="mx-auto max-w-prose text-muted-foreground md:text-lg">
            Every name gets three checks, run live and shown with their
            evidence, so you judge the risk instead of trusting a number.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
          <ReceiptFrame
            eyebrow="Domains"
            title="Answered by the registry"
            body="RDAP, the protocol registrars use internally, queried the moment you click. A domain marked open was unregistered seconds ago."
          >
            <ReceiptRow left="vantis.com" right="taken" tone="taken" />
            <ReceiptRow left="vantis.ai" right="open" tone="open" />
            <ReceiptRow left="vantis.io" right="open" tone="open" />
          </ReceiptFrame>

          <ReceiptFrame
            eyebrow="Social handles"
            title="Exact where possible, labeled where not"
            body="GitHub answers by public API, so those are exact. The rest load the live profile page, and we call that a best guess rather than fake a checkmark."
          >
            <ReceiptRow
              left="github.com/vantis"
              right="taken · exact"
              tone="taken"
            />
            <ReceiptRow
              left="x.com/vantis"
              right="open · best guess"
              tone="open"
            />
            <ReceiptRow
              left="instagram.com/vantis"
              right="open · best guess"
              tone="open"
            />
          </ReceiptFrame>

          <ReceiptFrame
            eyebrow="AI associations"
            title="Asked of three models, independently"
            body="If a model already answers for your name, it will credit that business with your reviews and your pricing. A domain search never sees this collision."
          >
            <ReceiptRow left="GPT" right="no association" tone="open" />
            <ReceiptRow
              left="Claude"
              right="Vantis · analytics firm"
              tone="taken"
            />
            <ReceiptRow left="Perplexity" right="no association" tone="open" />
          </ReceiptFrame>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          The same three checks, every time, on every name.{" "}
          <a href="/product#faq" className="text-primary underline">
            See exactly how each one works
          </a>
          .
        </p>
      </GsapReveal>
    </section>
  )
}
