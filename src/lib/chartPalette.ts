import { CATEGORIES } from "@/lib/constants";

// 12-slot categorical palette, one distinct color per category (see
// dataviz skill / scripts/validate_palette.js) — validated in this fixed
// order against the donut's ring adjacency (incl. wraparound) and the
// trend chart's line/legend adjacency, in both light and dark surfaces.
const SLOTS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
  "var(--chart-9)",
  "var(--chart-10)",
  "var(--chart-11)",
  "var(--chart-12)",
];

export interface CategoryStyle {
  color: string;
}

// Fixed per-category assignment (identity, never re-ranked by data).
const STYLE_BY_CATEGORY = new Map<string, CategoryStyle>(
  CATEGORIES.map((category, i) => [category, { color: SLOTS[i % SLOTS.length] }]),
);

const FALLBACK_STYLE: CategoryStyle = { color: "var(--chart-muted)" };

export function categoryStyle(category: string): CategoryStyle {
  return STYLE_BY_CATEGORY.get(category) ?? FALLBACK_STYLE;
}

// The chart's fixed category order (CATEGORIES order) — used so adjacent
// slices/lines always land on the palette's validated adjacent pairs.
export const CATEGORY_ORDER = CATEGORIES;
