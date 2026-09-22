"use client";

import { useState } from "react";
import { formatVnd } from "@/lib/constants";
import { categoryStyle } from "@/lib/chartPalette";

const MAX_SLICES = 5;
const OTHER_LABEL = "Các mục còn lại";
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
}: {
  totalsByCategory: Map<string, number>;
}) {
  const [active, setActive] = useState<number | null>(null);

  const rows = [...totalsByCategory.entries()]
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1]);

  const top = rows.slice(0, MAX_SLICES);
  const restTotal = rows.slice(MAX_SLICES).reduce((sum, [, amount]) => sum + amount, 0);

  const slices: Slice[] = top.map(([category, amount]) => ({
    category,
    amount,
    color: categoryStyle(category).color,
  }));
  if (restTotal > 0) {
    slices.push({ category: OTHER_LABEL, amount: restTotal, color: "var(--chart-muted)" });
  }

  const total = slices.reduce((sum, s) => sum + s.amount, 0);

  if (total === 0) {
    return (
      <p className="text-sm text-foreground/50 py-6 text-center">Chưa có dữ liệu chi tiêu.</p>
    );
  }

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
    return { ...s, start, end, pct: (s.amount / total) * 100 };
  });

  const activeSlice = active !== null ? arcs[active] : null;

  return (
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
            className={`flex items-center justify-between gap-2 rounded px-1.5 py-1 cursor-pointer ${
              active === i ? "bg-black/5 dark:bg-white/10" : ""
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
  );
}
