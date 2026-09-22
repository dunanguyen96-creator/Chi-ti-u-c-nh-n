"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, monthKeyFromDate, formatMonthLabel, formatVnd } from "@/lib/constants";
import type { Transaction, Income } from "@/lib/types";

export default function BaoCaoPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [txRes, incomeRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/income"),
      ]);
      setTransactions((await txRes.json()) as Transaction[]);
      setIncomes((await incomeRes.json()) as Income[]);
      setLoading(false);
    }
    load();
  }, []);

  const months = new Set<string>();
  transactions.forEach((t) => months.add(monthKeyFromDate(t.date)));
  incomes.forEach((i) => months.add(i.month));
  if (months.size === 0) months.add(monthKeyFromDate(new Date()));
  const sortedMonths = [...months].sort();

  const byCategoryMonth = new Map<string, Map<string, number>>();
  for (const category of CATEGORIES) byCategoryMonth.set(category, new Map());
  const totalByMonth = new Map<string, number>();

  for (const t of transactions) {
    const m = monthKeyFromDate(t.date);
    const catMap = byCategoryMonth.get(t.category) ?? new Map();
    catMap.set(m, (catMap.get(m) ?? 0) + t.amount);
    byCategoryMonth.set(t.category, catMap);
    totalByMonth.set(m, (totalByMonth.get(m) ?? 0) + t.amount);
  }

  const incomeByMonth = new Map(incomes.map((i) => [i.month, i.amount]));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 flex flex-col gap-6 w-full">
      <h1 className="text-xl font-semibold">Báo cáo theo tháng &amp; hạng mục</h1>

      {loading ? (
        <p className="text-sm text-foreground/50 py-6 text-center">Đang tải...</p>
      ) : (
        <div className="rounded-lg border border-black/10 dark:border-white/10 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[600px]">
            <thead>
              <tr className="text-left text-foreground/60 border-b border-black/10 dark:border-white/10">
                <th className="p-2 font-medium sticky left-0 bg-[var(--background)]">
                  Hạng mục
                </th>
                {sortedMonths.map((m) => (
                  <th key={m} className="p-2 font-medium text-right whitespace-nowrap">
                    {formatMonthLabel(m)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((category) => {
                const catMap = byCategoryMonth.get(category)!;
                const rowTotal = [...catMap.values()].reduce((a, b) => a + b, 0);
                if (rowTotal === 0) return null;
                return (
                  <tr
                    key={category}
                    className="border-b border-black/5 dark:border-white/10"
                  >
                    <td className="p-2 sticky left-0 bg-[var(--background)]">
                      {category}
                    </td>
                    {sortedMonths.map((m) => (
                      <td key={m} className="p-2 text-right tabular-nums">
                        {catMap.get(m) ? formatVnd(catMap.get(m)!) : "–"}
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr className="font-medium border-t border-black/10 dark:border-white/10">
                <td className="p-2 sticky left-0 bg-[var(--background)]">TỔNG CHI</td>
                {sortedMonths.map((m) => (
                  <td key={m} className="p-2 text-right tabular-nums text-rose-600">
                    {formatVnd(totalByMonth.get(m) ?? 0)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2 sticky left-0 bg-[var(--background)]">Thu nhập</td>
                {sortedMonths.map((m) => (
                  <td key={m} className="p-2 text-right tabular-nums text-emerald-600">
                    {formatVnd(incomeByMonth.get(m) ?? 0)}
                  </td>
                ))}
              </tr>
              <tr className="font-medium border-t border-black/10 dark:border-white/10">
                <td className="p-2 sticky left-0 bg-[var(--background)]">Chênh lệch</td>
                {sortedMonths.map((m) => {
                  const diff = (incomeByMonth.get(m) ?? 0) - (totalByMonth.get(m) ?? 0);
                  return (
                    <td
                      key={m}
                      className={`p-2 text-right tabular-nums ${
                        diff >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {formatVnd(diff)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
