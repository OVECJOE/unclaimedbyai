"use client"

import ReportError from "@/components/app/report-error"

export default function SearchDetailError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ReportError
      {...props}
      backHref="/dashboard/history"
      backLabel="Back to history"
    />
  )
}
