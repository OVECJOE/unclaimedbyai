"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

/* ------------------------------------------------------------------ *
 * Data sources (all figures publicly reported):
 *  - Domain totals: Verisign Domain Name Industry Brief (DNIB.com),
 *    selected quarter-ends, all TLDs.
 *  - Dispute filings: WIPO Arbitration and Mediation Center annual
 *    UDRP + ccTLD case filings.
 *  - ChatGPT weekly actives: OpenAI statements reported by TechCrunch,
 *    The Verge, CNBC and Business Insider.
 * ------------------------------------------------------------------ */

export const DOMAIN_SERIES = [
  { period: "Q4 '13", domains: 271.0 },
  { period: "Q1 '17", domains: 330.6 },
  { period: "Q4 '20", domains: 366.3 },
  { period: "Q2 '22", domains: 351.5 },
  { period: "Q2 '25", domains: 371.7 },
  { period: "Q3 '25", domains: 378.5 },
  { period: "Q4 '25", domains: 386.9 },
  { period: "Q1 '26", domains: 392.5 },
  { period: "Q2 '26", domains: 401.6 },
]

export const DISPUTE_SERIES = [
  { year: "2021", cases: 5128 },
  { year: "2022", cases: 5731 },
  { year: "2023", cases: 6192 },
  { year: "2024", cases: 6168 },
  { year: "2025", cases: 6282 },
]

export const CHATGPT_SERIES = [
  { when: "Nov '23", users: 100 },
  { when: "Aug '24", users: 200 },
  { when: "Dec '24", users: 300 },
  { when: "Feb '25", users: 400 },
  { when: "Mar '25", users: 500 },
  { when: "Aug '25", users: 700 },
  { when: "Oct '25", users: 800 },
  { when: "Feb '26", users: 900 },
]

const axisTick = {
  fontSize: 10,
  fontFamily: "var(--font-mono)",
} as const

const tooltipLabelStyle = {
  fontSize: 11,
  fontFamily: "var(--font-mono)",
} as const

const domainConfig = {
  domains: {
    label: "Registrations",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig

export function DomainGrowthChart() {
  return (
    <ChartContainer
      config={domainConfig}
      className="aspect-auto h-64 w-full sm:h-72"
    >
      <AreaChart data={DOMAIN_SERIES} margin={{ top: 8, right: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="fillDomains" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="period"
          tickLine={false}
          axisLine={false}
          tick={axisTick}
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={axisTick}
          width={44}
          domain={[250, 420]}
          tickFormatter={(value: number) => `${value}M`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelStyle={tooltipLabelStyle}
              formatter={(value) =>
                `${Number(value).toFixed(1)}M registrations (domains)`
              }
            />
          }
        />
        <Area
          type="monotone"
          dataKey="domains"
          stroke="var(--color-primary)"
          strokeWidth={2}
          fill="url(#fillDomains)"
        />
      </AreaChart>
    </ChartContainer>
  )
}

const disputeConfig = {
  cases: {
    label: "Cases filed",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig

export function DisputeFilingsChart() {
  return (
    <ChartContainer
      config={disputeConfig}
      className="aspect-auto h-64 w-full sm:h-72"
    >
      <BarChart data={DISPUTE_SERIES} margin={{ top: 8, right: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={false}
          tick={axisTick}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={axisTick}
          width={44}
          domain={[4800, 6500]}
          tickFormatter={(value: number) => value.toLocaleString("en-US")}
        />
        <ChartTooltip
          cursor={{ fill: "var(--color-muted)" }}
          content={
            <ChartTooltipContent
              labelStyle={tooltipLabelStyle}
              formatter={(value) =>
                `${Number(value).toLocaleString("en-US")} cases filed at WIPO`
              }
            />
          }
        />
        <Bar
          dataKey="cases"
          fill="var(--color-chart-2)"
          radius={[3, 3, 0, 0]}
          maxBarSize={56}
        />
      </BarChart>
    </ChartContainer>
  )
}

const chatgptConfig = {
  users: {
    label: "Weekly users",
    color: "var(--color-chart-3)",
  },
} satisfies ChartConfig

export function ChatGptGrowthChart() {
  return (
    <ChartContainer
      config={chatgptConfig}
      className="aspect-auto h-64 w-full sm:h-72"
    >
      <LineChart data={CHATGPT_SERIES} margin={{ top: 8, right: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="when"
          tickLine={false}
          axisLine={false}
          tick={axisTick}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={axisTick}
          width={44}
          domain={[0, 1000]}
          tickFormatter={(value: number) => `${value}M`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelStyle={tooltipLabelStyle}
              formatter={(value) =>
                `${Number(value).toLocaleString("en-US")}M weekly users (ChatGPT)`
              }
            />
          }
        />
        <Line
          type="monotone"
          dataKey="users"
          stroke="var(--color-chart-3)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--color-chart-3)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ChartContainer>
  )
}
