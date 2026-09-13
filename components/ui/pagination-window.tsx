import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { getVisiblePages } from "@/lib/pagination"

type PaginationWindowProps = {
  currentPage: number
  pageCount: number
  windowSize?: number
  basePath: string
}

type DisabledBoundProps = {
  direction: "previous" | "next"
  text: string
}

function PaginationBoundButton({ direction, text }: DisabledBoundProps) {
  const isPrevious = direction === "previous"
  const icon = isPrevious ? ArrowLeft01Icon : ArrowRight01Icon
  return (
    <Button
      variant="ghost"
      size="default"
      disabled
      aria-disabled="true"
      className={isPrevious ? "ps-2!" : "pe-2!"}
    >
      {isPrevious && <HugeiconsIcon icon={icon} strokeWidth={2} className="rtl:rotate-180" />}
      <span className="hidden sm:block">{text}</span>
      {!isPrevious && <HugeiconsIcon icon={icon} strokeWidth={2} className="rtl:rotate-180" />}
    </Button>
  )
}

function PaginationBoundItem({
  direction,
  text,
  href: pageHref,
}: DisabledBoundProps & { href?: string }) {
  return (
    <PaginationItem>
      {pageHref ? (
        direction === "previous" ? (
          <PaginationPrevious href={pageHref} />
        ) : (
          <PaginationNext href={pageHref} />
        )
      ) : (
        <PaginationBoundButton direction={direction} text={text} />
      )}
    </PaginationItem>
  )
}

export function PaginationWindow({
  currentPage,
  pageCount,
  windowSize = 3,
  basePath,
}: PaginationWindowProps) {
  if (pageCount <= 1) return null

  const windowPages = getVisiblePages(currentPage, pageCount, windowSize)

  const hasPrevious = currentPage > 1
  const hasNext = currentPage < pageCount
  const lastVisible = windowPages[windowPages.length - 1]
  const showsTrailing = lastVisible < pageCount

  const href = (page: number) => `${basePath}?page=${page}`

  return (
    <Pagination>
      <PaginationContent>
        <PaginationBoundItem
          direction="previous"
          text="Previous"
          href={hasPrevious ? href(currentPage - 1) : undefined}
        />

        {windowPages.map((page) => (
          <PaginationItem key={`page-${page}`}>
            <PaginationLink href={href(page)} isActive={page === currentPage}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {showsTrailing && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href={href(pageCount)}>{pageCount}</PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationBoundItem
          direction="next"
          text="Next"
          href={hasNext ? href(currentPage + 1) : undefined}
        />
      </PaginationContent>
    </Pagination>
  )
}