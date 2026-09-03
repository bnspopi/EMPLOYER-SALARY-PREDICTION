"use client";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Currency, InsightsReport } from "@/lib/types";
import { formatMoney } from "@/lib/format";

const AXIS = { fontSize: 11, fill: "var(--color-dim)" } as const;
const GRID = "var(--color-line)";
const TOOLTIP_STYLE = {
  background: "var(--color-panel)",
  border: "1px solid var(--color-line-2)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--color-fg)",
} as const;

/** 12-month median trend. */
export function TrendChart({ data, currency }: { data: InsightsReport["trend"]; currency: Currency }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} interval="preserveStartEnd" />
        <YAxis
          tick={AXIS}
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={(v: number) => formatMoney(v, currency, { compact: true })}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelStyle={{ color: "var(--color-muted)" }}
          formatter={(value) => [formatMoney(Number(value), currency), "Median"]}
        />
        <Line
          type="monotone"
          dataKey="median"
          stroke="var(--color-cyan)"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, fill: "var(--color-cyan)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** 12-month demand index (0-100). */
export function DemandChart({ data }: { data: InsightsReport["trend"] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="demandFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-gold)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-gold)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} interval="preserveStartEnd" />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={32} domain={[0, 100]} />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelStyle={{ color: "var(--color-muted)" }}
          formatter={(value) => [`${Math.round(Number(value))} / 100`, "Demand"]}
        />
        <Area type="monotone" dataKey="demand" stroke="var(--color-gold)" strokeWidth={2} fill="url(#demandFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Remote vs city premium (top 8 cities). */
export function CityPremiumChart({ data, currency }: { data: InsightsReport["cityPremiums"]; currency: Currency }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v}%`} />
        <YAxis type="category" dataKey="city" tick={AXIS} tickLine={false} axisLine={false} width={90} />
        <Tooltip
          cursor={{ fill: "var(--color-line)", opacity: 0.4 }}
          contentStyle={TOOLTIP_STYLE}
          labelStyle={{ color: "var(--color-muted)" }}
          formatter={(value, _name, item) => {
            const median = (item?.payload as { median?: number } | undefined)?.median;
            const pct = Number(value);
            return [`${pct > 0 ? "+" : ""}${pct}%${median != null ? ` · ${formatMoney(median, currency, { compact: true })}` : ""}`, "Premium"];
          }}
        />
        <Bar dataKey="premiumPct" radius={[0, 4, 4, 0]}>
          {data.map((d) => (
            <Cell key={d.city} fill={d.premiumPct >= 0 ? "var(--color-cyan)" : "var(--color-red)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
