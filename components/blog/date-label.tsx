"use client"

import { useSyncExternalStore } from "react"

const fullFormat = new Intl.DateTimeFormat("en", {
  dateStyle: "long",
  timeStyle: "short",
})

const noSubscribe = () => () => {}

function formatOn(
  value: string,
  dateStyle: "medium" | "long",
  withTime: boolean
) {
  return new Intl.DateTimeFormat("en", {
    dateStyle,
    timeStyle: withTime ? "short" : undefined,
  }).format(new Date(value))
}

export default function DateLabel({
  value,
  dateStyle = "medium",
  withTime = false,
  className,
}: {
  value: string
  dateStyle?: "medium" | "long"
  withTime?: boolean
  className?: string
}) {
  const formatted = useSyncExternalStore(
    noSubscribe,
    () => formatOn(value, dateStyle, withTime),
    () => null
  )

  return (
    <time
      dateTime={value}
      title={formatted ? fullFormat.format(new Date(value)) : undefined}
      className={className}
    >
      {formatted ?? value.slice(0, 10)}
    </time>
  )
}
