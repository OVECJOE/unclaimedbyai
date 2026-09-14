"use client"

import { cn } from "@/lib/utils"

type Tier = "Excellent" | "Good" | "Okay" | "Poor"

const strokeByTier: Record<Tier, string> = {
  Excellent: "stroke-green-600",
  Good: "stroke-lime-700",
  Okay: "stroke-yellow-500",
  Poor: "stroke-red-600",
}

const textByTier: Record<Tier, string> = {
  Excellent: "text-green-600",
  Good: "text-lime-700",
  Okay: "text-yellow-600",
  Poor: "text-red-600",
}

export function ScoreGauge({
  score,
  tier,
  size = 96,
}: {
  score: number
  tier: Tier
  size?: number
}) {
  const inset = 4
  const dimension = size - inset * 2

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* track */}
        <rect
          x={inset}
          y={inset}
          width={dimension}
          height={dimension}
          rx={12}
          pathLength={100}
          fill="none"
          strokeWidth={8}
          className="stroke-border"
        />
        {/* progress */}
        <rect
          x={inset}
          y={inset}
          width={dimension}
          height={dimension}
          rx={12}
          pathLength={100}
          fill="none"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={100}
          strokeDashoffset={100 - score}
          className={cn("transition-[stroke-dashoffset] duration-500 ease-out", strokeByTier[tier])}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-xl font-semibold", textByTier[tier])}>{score}</span>
        <span className="text-[10px] text-muted-foreground">/100</span>
      </div>
    </div>
  )
}
