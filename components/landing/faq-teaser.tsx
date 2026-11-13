import Link from "next/link"
import { FaqItem, FaqList } from "@/components/ui/faq-list"
import { SectionHeader } from "@/components/public/section-header"
import { FAQS } from "@/app/(public)/product/constants"

export const LANDING_FAQ_IDS = [
  "what-does-unclaimedbyai-check-when-i-enter-a-name",
  "is-unclaimedbyai-free-to-use",
  "what-is-ai-association-check-and-why-does-it-matter-for-new-name",
  "how-long-does-a-name-check-take",
  "does-this-replace-trademark-search",
  "can-i-buy-the-domain-through-you",
]

export const LANDING_FAQS = LANDING_FAQ_IDS.map((id) =>
  FAQS.find((faq) => faq.id === id)
).filter((faq): faq is (typeof FAQS)[number] => Boolean(faq))

/** The six questions that stand between a visitor and their first check. */
export default function FaqTeaser() {
  return (
    <section id="faq" className="scroll-mt-20 border-b px-4 py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <SectionHeader
            align="start"
            eyebrow="Questions"
            title="Asked, and"
            accent="answered plainly."
          />
          <Link
            href="/product#faq"
            className="inline-flex text-sm text-primary underline underline-offset-4"
          >
            All {FAQS.length} questions
          </Link>
        </div>
        <FaqList className="border-t">
          {LANDING_FAQS.map((faq, index) => (
            <FaqItem key={faq.id} question={faq.question} open={index === 0}>
              {faq.body ?? faq.answer}
            </FaqItem>
          ))}
        </FaqList>
      </div>
    </section>
  )
}
