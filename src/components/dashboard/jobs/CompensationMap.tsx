"use client";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ReactNode } from "react";
import { getInsights } from "@/lib/engine";
import { formatMoney } from "@/lib/format";
import type { Currency } from "@/lib/types";

const AXIS = { fontSize: 11, fill: "var(--color-dim)" } as const;
const GRID = "var(--color-line)";
const TOOLTIP_STYLE = {
  background: "var(--color-panel)",
  border: "1px solid var(--color-line-2)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--color-fg)",
} as const;

/** Median compensation for a role across the top 8 cities in the resolved region. */
export function CompensationMap({ role, location }: { role: string; location: string }) {
  const report = useMemo(() => getInsights(role, location), [role, location]);
  const currency: Currency = report.currency;
  const data = useMemo(
    () =>
      report.cityPremiums
        .map((c) => ({ city: c.city, median: c.median }))
        .sort((a, b) => b.median - a.median),
    [report],
  );
  const max = Math.max(...data.map((d) => d.median), 1);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm text-muted">
          Median for <span className="font-semibold text-fg">{report.role}</span> · {report.location.split(",").pop()?.trim() || report.location}
        </span>
        <span className="mono-caps text-dim">{currency}</span>
      </div>
      <ResponsiveContainer width="100%" height={Math.max(240, data.length * 38)}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 64, left: 8, bottom: 0 }}>
          <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, max * 1.12]}
            tick={AXIS}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            tickFormatter={(v: number) => formatMoney(v, currency, { compact: true })}
          />
          <YAxis type="category" dataKey="city" tick={AXIS} tickLine={false} axisLine={false} width={92} />
          <Tooltip
            cursor={{ fill: "var(--color-line)", opacity: 0.4 }}
            contentStyle={TOOLTIP_STYLE}
            labelStyle={{ color: "var(--color-muted)" }}
            formatter={(value) => [formatMoney(Number(value), currency), "Median"]}
          />
          <Bar dataKey="median" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell key={d.city} fill={i === 0 ? "var(--color-gold)" : "var(--color-cyan)"} fillOpacity={i === 0 ? 1 : 0.85} />
            ))}
            <LabelList
              dataKey="median"
              position="right"
              formatter={(value: ReactNode) => formatMoney(Number(value), currency, { compact: true })}
              style={{ fill: "var(--color-muted)", fontSize: 11, fontVariantNumeric: "tabular-nums" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
