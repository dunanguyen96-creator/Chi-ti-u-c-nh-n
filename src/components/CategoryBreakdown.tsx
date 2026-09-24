import { CATEGORIES, CATEGORY_ICON, formatVnd } from "@/lib/constants";
import { categoryTotals } from "@/lib/reportUtils";
import type { Transaction, CategoryBaseline } from "@/lib/types";

const PALETTE = [
  "#0d9488",
  "#2563eb",
  "#db2777",
  "#d97706",
  "#7c3aed",
  "#059669",
  "#dc2626",
  "#0891b2",
  "#ca8a04",
  "#9333ea",
  "#4f46e5",
  "#64748b",
];

const COLOR_BY_CATEGORY = Object.fromEntries(
  CATEGORIES.map((c, i) => [c, PALETTE[i % PALETTE.length]]),
);

export default function CategoryBreakdown({
  transactions,
  baselines = [],
}: {
  transactions: Transaction[];
  baselines?: CategoryBaseline[];
}) {
  const totals = categoryTotals(transactions, baselines);
  const rows = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .filter(([, amount]) => amount > 0);

  const max = rows.length > 0 ? rows[0][1] : 1;

  if (rows.length === 0) {
    return (
      <p className="text-sm text-foreground/50 py-4 text-center">
        Chưa có dữ liệu chi tiêu.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map(([category, amount]) => (
        <li
          key={category}
          className="row-hover row-hover-edge flex flex-col gap-1 py-1 px-2 -mx-2 rounded-md"
        >
          <div className="flex justify-between text-sm gap-2">
            <span className="flex items-center gap-1.5 truncate" title={category}>
              <span aria-hidden>{CATEGORY_ICON[category as keyof typeof CATEGORY_ICON] ?? "🔖"}</span>
              <span className="truncate">{category}</span>
            </span>
            <span className="shrink-0 tabular-nums text-foreground/70">
              {formatVnd(amount)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max((amount / max) * 100, 3)}%`,
                backgroundColor: COLOR_BY_CATEGORY[category] ?? "#64748b",
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
