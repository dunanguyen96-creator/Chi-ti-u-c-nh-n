import type { Transaction, CategoryBaseline } from "@/lib/types";

/** Category totals = baseline (số gốc) + sum of transactions for that category. */
export function categoryTotals(
  transactions: Transaction[],
  baselines: CategoryBaseline[],
): Map<string, number> {
  const totals = new Map<string, number>();
  for (const b of baselines) {
    totals.set(b.category, (totals.get(b.category) ?? 0) + b.amount);
  }
  for (const t of transactions) {
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
  }
  return totals;
}
