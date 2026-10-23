"use client"

import ReportError from "@/components/app/report-error"

export default function ResultsError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ReportError {...props} backHref="/" backLabel="Go home" />
}
