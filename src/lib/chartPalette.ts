import { CATEGORIES } from "@/lib/constants";

// 8-slot validated categorical palette (see dataviz skill / palette.md), as
// CSS custom properties so light/dark swap automatically (globals.css).
const SLOTS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];

export interface CategoryStyle {
  color: string;
  dashed: boolean;
}

// Fixed per-category assignment (identity, never re-ranked by data) — the
// 9th–12th categories reuse slots 1–4 with a dashed stroke so they stay
// distinguishable without generating new hues.
const STYLE_BY_CATEGORY = new Map<string, CategoryStyle>(
  CATEGORIES.map((category, i) => [
    category,
    { color: SLOTS[i % SLOTS.length], dashed: i >= SLOTS.length },
  ]),
);

const FALLBACK_STYLE: CategoryStyle = { color: "var(--chart-muted)", dashed: false };

export function categoryStyle(category: string): CategoryStyle {
  return STYLE_BY_CATEGORY.get(category) ?? FALLBACK_STYLE;
}
