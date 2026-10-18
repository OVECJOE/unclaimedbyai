"use client"

import { Area, AreaChart, Tooltip } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  CHATGPT_SERIES,
  DISPUTE_SERIES,
  DOMAIN_SERIES,
} from "@/components/about/charts"

/**
 * The three public datasets that explain why this product exists, drawn
 * as compact sparkline-style areas for the homepage. The full charts
 * with axes live on the about page; these are the glance version, so no
 * gridlines, no axes, one flat fill, and a mono tooltip on hover.
 */

const flatConfig = {
  value: { color: "var(--primary)" },
} satisfies ChartConfig

type Point = { x: string; y: number }

function SparkArea({ data, ariaLabel }: { data: Point[]; ariaLabel: string }) {
  return (
    <div role="img" aria-label={ariaLabel}>
      <ChartContainer config={flatConfig} className="h-24 w-full">
        <AreaChart
          data={data}
          margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
        >
          <Tooltip
            content={<ChartTooltipContent hideLabel />}
            cursor={{ stroke: "var(--border)" }}
          />
          <Area
            type="monotone"
            dataKey="y"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="var(--primary)"
            fillOpacity={0.1}
            isAnimationActive={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}

export function DomainPressureChart() {
  return (
    <SparkArea
      data={DOMAIN_SERIES.map((d) => ({ x: d.period, y: d.domains }))}
      ariaLabel="Registered domains growing from 271 million in 2013 to 401.6 million in 2026"
    />
  )
}

export function DisputePressureChart() {
  return (
    <SparkArea
      data={DISPUTE_SERIES.map((d) => ({ x: d.year, y: d.cases }))}
      ariaLabel="Name dispute cases filed each year, rising to a record 6,282 in 2025"
    />
  )
}

export function ChatGptPressureChart() {
  return (
    <SparkArea
      data={CHATGPT_SERIES.map((d) => ({ x: d.when, y: d.users }))}
      ariaLabel="Weekly ChatGPT users growing to 900 million by early 2026"
    />
  )
}
