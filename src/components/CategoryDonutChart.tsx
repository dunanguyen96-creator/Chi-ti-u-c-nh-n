"use client";

import { useState } from "react";
import { formatVnd, formatMonthLabel } from "@/lib/constants";
import { categoryStyle, CATEGORY_ORDER } from "@/lib/chartPalette";

const GAP_DEG = 1.5;

interface Slice {
  category: string;
  amount: number;
  color: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, rOuter: number, rInner: number, start: number, end: number) {
  const large = end - start > 180 ? 1 : 0;
  const startOuter = polarToCartesian(cx, cy, rOuter, end);
  const endOuter = polarToCartesian(cx, cy, rOuter, start);
  const startInner = polarToCartesian(cx, cy, rInner, start);
  const endInner = polarToCartesian(cx, cy, rInner, end);
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${rInner} ${rInner} 0 ${large} 1 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

export default function CategoryDonutChart({
  totalsByCategory,
  month,
  onMonthChange,
}: {
  totalsByCategory: Map<string, number>;
  month: string;
  onMonthChange: (month: string) => void;
}) {
  const [active, setActive] = useState<number | null>(null);

  // Fixed category order (not sorted by amount): keeps every slice's
  // position stable month to month, and matches the palette's validated
  // adjacent-pair order around the ring.
  const slices: Slice[] = CATEGORY_ORDER.filter((category) => (totalsByCategory.get(category) ?? 0) > 0).map(
    (category) => ({
      category,
      amount: totalsByCategory.get(category)!,
      color: categoryStyle(category).color,
    }),
  );

  const total = slices.reduce((sum, s) => sum + s.amount, 0);

  const cx = 100;
  const cy = 100;
  const rOuter = 90;
  const rInner = 56;

  const sweeps = slices.map((s) => (s.amount / total) * 360);
  const cursors = sweeps.reduce<number[]>((acc, sweep, i) => {
    acc.push((acc[i - 1] ?? 0) + sweep);
    return acc;
  }, []);
  const arcs = slices.map((s, i) => {
    const sweep = sweeps[i];
    const cursor = cursors[i] - sweep;
    const start = cursor + Math.min(GAP_DEG / 2, sweep / 4);
    const end = cursor + sweep - Math.min(GAP_DEG / 2, sweep / 4);
    return { ...s, start, end, pct: total > 0 ? (s.amount / total) * 100 : 0 };
  });

  const activeSlice = active !== null ? arcs[active] : null;

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm self-start">
        Tháng
        <input
          type="month"
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-2 py-1.5"
        />
        <span className="text-foreground/60">({formatMonthLabel(month)})</span>
      </label>

      {total === 0 ? (
        <p className="text-sm text-foreground/50 py-6 text-center">Chưa có dữ liệu chi tiêu.</p>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <svg viewBox="0 0 200 200" className="w-52 h-52" role="img" aria-label="Biểu đồ tỉ lệ chi theo hạng mục">
              {arcs.map((s, i) => (
                <path
                  key={s.category}
                  d={arcPath(cx, cy, active === i ? rOuter + 3 : rOuter, rInner, s.start, s.end)}
                  fill={s.color}
                  tabIndex={0}
                  className="cursor-pointer outline-none transition-[d] duration-150"
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  onClick={() => setActive(active === i ? null : i)}
                >
                  <title>
                    {s.category}: {formatVnd(s.amount)} ({s.pct.toFixed(1)}%)
                  </title>
                </path>
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-8 text-center">
              {activeSlice ? (
                <>
                  <span className="text-xs text-foreground/60 truncate max-w-[7rem]">
                    {activeSlice.category}
                  </span>
                  <span className="text-base font-semibold tabular-nums">
                    {formatVnd(activeSlice.amount)}
                  </span>
                  <span className="text-xs text-foreground/50">{activeSlice.pct.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <span className="text-xs text-foreground/60">Tổng chi</span>
                  <span className="text-base font-semibold tabular-nums">{formatVnd(total)}</span>
                </>
              )}
            </div>
          </div>

          <ul className="flex flex-col gap-1.5 text-sm w-full">
            {arcs.map((s, i) => (
              <li
                key={s.category}
                className={`flex items-center justify-between gap-2 rounded px-1.5 py-1 cursor-pointer border-l-2 transition-colors ${
                  active === i ? "bg-[var(--accent-soft)] border-l-[var(--accent)]" : "border-l-transparent"
                }`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive(active === i ? null : i)}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="truncate text-foreground/80">{s.category}</span>
                </span>
                <span className="tabular-nums text-foreground/70 shrink-0">
                  {formatVnd(s.amount)} · {s.pct.toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
