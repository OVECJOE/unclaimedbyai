import { DotIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

type DotsProps = {
  paddedIcon?: typeof DotIcon
  count: number
  prefix?: string
  suffix?: string
  color?: string
  size?: number
}

export function PaddedText({
  count,
  color,
  size = 24,
  prefix,
  suffix,
  paddedIcon,
}: DotsProps) {
  return (
    <span className="inline-flex items-center">
      {prefix && <span>{prefix}</span>}
      <span className="inline-flex items-center">
        {[...Array(count)].map((_, i) => (
          <HugeiconsIcon
            key={i}
            icon={paddedIcon ?? DotIcon}
            color={color}
            size={size}
            className="m-0 p-0"
          />
        ))}
      </span>
      {suffix && <span>{suffix}</span>}
    </span>
  )
}
