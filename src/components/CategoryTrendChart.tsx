"use client";

import { useMemo, useRef, useState } from "react";
import { CATEGORIES, formatMonthLabel, formatVnd } from "@/lib/constants";
import { categoryStyle } from "@/lib/chartPalette";

const WIDTH = 640;
const HEIGHT = 220;
const PAD_LEFT = 44;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;
const PLOT_W = WIDTH - PAD_LEFT - PAD_RIGHT;
const PLOT_H = HEIGHT - PAD_TOP - PAD_BOTTOM;
const DEFAULT_VISIBLE = 5;

function formatShort(amount: number): string {
  if (amount >= 1_000_000) {
    const v = amount / 1_000_000;
    return `${v % 1 === 0 ? v : v.toFixed(1)}tr`;
  }
  if (amount >= 1_000) return `${Math.round(amount / 1000)}k`;
  return String(Math.round(amount));
}

export default function CategoryTrendChart({
  months,
  dataByMonth,
}: {
  months: string[];
  dataByMonth: Map<string, Map<string, number>>;
}) {
  const totalByCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const category of CATEGORIES) {
      let sum = 0;
      for (const m of months) sum += dataByMonth.get(m)?.get(category) ?? 0;
      totals.set(category, sum);
    }
    return totals;
  }, [months, dataByMonth]);

  const defaultVisible = useMemo(() => {
    return new Set(
      [...totalByCategory.entries()]
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, DEFAULT_VISIBLE)
        .map(([c]) => c),
    );
  }, [totalByCategory]);

  // Lazy init: this component only mounts once its data has loaded (parent
  // gates on `loading`), so the default selection is computed once from the
  // first real dataset rather than needing to re-sync later.
  const [visible, setVisible] = useState<Set<string>>(() => defaultVisible);

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  function toggle(category: string) {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  const visibleCategories = CATEGORIES.filter((c) => visible.has(c));

  const maxY = Math.max(
    1,
    ...months.map((m) =>
      Math.max(0, ...visibleCategories.map((c) => dataByMonth.get(m)?.get(c) ?? 0)),
    ),
  );

  function xAt(i: number) {
    return months.length <= 1
      ? PAD_LEFT + PLOT_W / 2
      : PAD_LEFT + (i / (months.length - 1)) * PLOT_W;
  }
  function yAt(v: number) {
    return PAD_TOP + PLOT_H - (v / maxY) * PLOT_H;
  }

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxY);

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg || months.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const ratio = months.length <= 1 ? 0 : (px - PAD_LEFT) / PLOT_W;
    const idx = Math.round(ratio * (months.length - 1));
    setHoverIdx(Math.min(Math.max(idx, 0), months.length - 1));
  }

  const hoverMonth = hoverIdx !== null ? months[hoverIdx] : null;

  return (
    <div className="flex flex-col gap-3">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        role="img"
        aria-label="Biểu đồ xu hướng chi tiêu theo tháng"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverIdx(null)}
      >
        {yTicks.map((v, i) => (
          <g key={i}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={yAt(v)}
              y2={yAt(v)}
              stroke="var(--chart-grid)"
              strokeWidth={1}
            />
            <text x={PAD_LEFT - 6} y={yAt(v) + 3} textAnchor="end" fontSize={9} fill="var(--chart-muted)">
              {formatShort(v)}
            </text>
          </g>
        ))}

        {months.map((m, i) => (
          <text
            key={m}
            x={xAt(i)}
            y={HEIGHT - 6}
            textAnchor="middle"
            fontSize={9}
            fill="var(--chart-muted)"
          >
            {formatMonthLabel(m)}
          </text>
        ))}

        {hoverIdx !== null && (
          <line
            x1={xAt(hoverIdx)}
            x2={xAt(hoverIdx)}
            y1={PAD_TOP}
            y2={PAD_TOP + PLOT_H}
            stroke="var(--chart-axis)"
            strokeWidth={1}
          />
        )}

        {visibleCategories.map((category) => {
          const style = categoryStyle(category);
          const points = months.map((m, i) => {
            const v = dataByMonth.get(m)?.get(category) ?? 0;
            return `${xAt(i)},${yAt(v)}`;
          });
          return (
            <g key={category}>
              <polyline
                points={points.join(" ")}
                fill="none"
                stroke={style.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {hoverIdx !== null && (
                <circle
                  cx={xAt(hoverIdx)}
                  cy={yAt(dataByMonth.get(months[hoverIdx])?.get(category) ?? 0)}
                  r={4}
                  fill={style.color}
                  stroke="var(--chart-surface)"
                  strokeWidth={2}
                />
              )}
            </g>
          );
        })}
      </svg>

      {hoverMonth && (
        <div className="text-xs rounded-lg border border-[var(--card-border)] bg-[var(--accent-soft)]/40 p-2 -mt-1 flex flex-col gap-1">
          <span className="font-medium text-foreground/80">{formatMonthLabel(hoverMonth)}</span>
          {visibleCategories.map((category) => (
            <div key={category} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-3 h-0.5 shrink-0"
                  style={{ backgroundColor: categoryStyle(category).color }}
                />
                <span className="truncate text-foreground/70">{category}</span>
              </span>
              <span className="tabular-nums font-medium shrink-0">
                {formatVnd(dataByMonth.get(hoverMonth)?.get(category) ?? 0)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {CATEGORIES.map((category) => {
          const style = categoryStyle(category);
          const checked = visible.has(category);
          return (
            <label
              key={category}
              className="flex items-center gap-1.5 text-xs cursor-pointer select-none px-1.5 py-0.5 -mx-1.5 -my-0.5 rounded-md transition-colors hover:bg-[var(--accent-soft)]"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(category)}
                className="accent-[var(--accent)]"
              />
              <span
                className="w-3 h-0.5 shrink-0"
                style={{ backgroundColor: style.color, opacity: checked ? 1 : 0.35 }}
              />
              <span className={checked ? "text-foreground/80" : "text-foreground/40"}>
                {category}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
