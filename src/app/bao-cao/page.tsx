"use client";

import { useCallback, useEffect, useState } from "react";
import { CATEGORIES, monthKeyFromDate, formatMonthLabel, formatVnd } from "@/lib/constants";
import { categoryTotals } from "@/lib/reportUtils";
import type { Transaction, Income, CategoryBaseline } from "@/lib/types";

export default function BaoCaoPage() {
  const [month, setMonth] = useState(() => monthKeyFromDate(new Date()));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [baselines, setBaselines] = useState<CategoryBaseline[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (m: string) => {
    setLoading(true);
    const [txRes, incomeRes, baselineRes] = await Promise.all([
      fetch(`/api/transactions?month=${m}`),
      fetch(`/api/income?month=${m}`),
      fetch(`/api/category-baselines?month=${m}`),
    ]);
    setTransactions((await txRes.json()) as Transaction[]);
    setIncomes((await incomeRes.json()) as Income[]);
    setBaselines((await baselineRes.json()) as CategoryBaseline[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount/month change
    load(month);
  }, [month, load]);

  const totalsByCategory = categoryTotals(transactions, baselines);

  const totalExpense = [...totalsByCategory.values()].reduce((sum, v) => sum + v, 0);
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Báo cáo</h1>
        <label className="flex items-center gap-2 text-sm">
          Tháng
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-md border border-black/15 dark:border-white/15 bg-transparent px-2 py-1.5"
          />
          <span className="text-foreground/60">({formatMonthLabel(month)})</span>
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-foreground/50 py-6 text-center">Đang tải...</p>
      ) : (
        <div className="rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-foreground/60 border-b border-black/10 dark:border-white/10">
                <th className="p-2 font-medium">Hạng mục</th>
                <th className="p-2 font-medium text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((category) => (
                <tr key={category} className="border-b border-black/5 dark:border-white/10">
                  <td className="p-2">{category}</td>
                  <td className="p-2 text-right tabular-nums">
                    {totalsByCategory.get(category) ? formatVnd(totalsByCategory.get(category)!) : "–"}
                  </td>
                </tr>
              ))}
              <tr className="font-medium border-t border-black/10 dark:border-white/10">
                <td className="p-2">TỔNG CHI</td>
                <td className="p-2 text-right tabular-nums text-rose-600">{formatVnd(totalExpense)}</td>
              </tr>
              <tr>
                <td className="p-2">Thu nhập</td>
                <td className="p-2 text-right tabular-nums text-emerald-600">{formatVnd(totalIncome)}</td>
              </tr>
              <tr className="font-medium border-t border-black/10 dark:border-white/10">
                <td className="p-2">Chênh lệch</td>
                <td
                  className={`p-2 text-right tabular-nums ${
                    balance >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {formatVnd(balance)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
