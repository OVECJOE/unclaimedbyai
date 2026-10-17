"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { ActivityDay } from "@/lib/api"

const config = {
  searches: { label: "Searches", color: "var(--primary)" },
  checks: { label: "Checks", color: "var(--chart-2)" },
} satisfies ChartConfig

function shortDay(value: string): string {
  const [, month, day] = value.split("-")
  return `${month}/${day}`
}

/**
 * The last 30 days of account activity, one flat line each for
 * searches and checks. Recharts renders SVG here, so the chart is the
 * only thing on the home page that needs the client.
 */
export default function ActivityChart({ days }: { days: ActivityDay[] }) {
  const data = days.map((day) => ({
    ...day,
    label: shortDay(day.date),
  }))
  return (
    <ChartContainer config={config} className="h-56 w-full">
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
      >
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval="preserveStartEnd"
          minTickGap={24}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={40}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="searches"
          stroke="var(--color-searches)"
          strokeWidth={2}
          fill="var(--color-searches)"
          fillOpacity={0.12}
        />
        <Area
          type="monotone"
          dataKey="checks"
          stroke="var(--color-checks)"
          strokeWidth={2}
          fill="var(--color-checks)"
          fillOpacity={0.12}
        />
      </AreaChart>
    </ChartContainer>
  )
}
