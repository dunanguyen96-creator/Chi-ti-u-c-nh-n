"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORIES,
  monthKeyFromDate,
  formatMonthLabel,
  formatVnd,
  shiftMonth,
} from "@/lib/constants";
import { categoryTotals } from "@/lib/reportUtils";
import CategoryDonutChart from "@/components/CategoryDonutChart";
import CategoryTrendChart from "@/components/CategoryTrendChart";
import type { Transaction, Income, CategoryBaseline } from "@/lib/types";

const TREND_MONTHS = 6;

export default function BaoCaoPage() {
  const [month, setMonth] = useState(() => monthKeyFromDate(new Date()));
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [allBaselines, setAllBaselines] = useState<CategoryBaseline[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  // Transactions/baselines are fetched once in full: the donut needs the
  // selected month, the trend chart needs a window of months, and this
  // app's data volume is small enough that filtering client-side avoids a
  // second range-query API.
  const allDataLoaded = useRef(false);

  const load = useCallback(async (m: string) => {
    setLoading(true);
    const requests: [Promise<Response>, Promise<Response>?, Promise<Response>?] = [
      fetch(`/api/income?month=${m}`),
    ];
    if (!allDataLoaded.current) {
      requests.push(fetch("/api/transactions"), fetch("/api/category-baselines"));
    }
    const [incomeRes, txRes, baselineRes] = await Promise.all(requests);
    setIncomes((await incomeRes.json()) as Income[]);
    if (txRes && baselineRes) {
      setAllTransactions((await txRes.json()) as Transaction[]);
      setAllBaselines((await baselineRes.json()) as CategoryBaseline[]);
      allDataLoaded.current = true;
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount/month change
    load(month);
  }, [month, load]);

  const totalsByCategory = useMemo(() => {
    const monthTx = allTransactions.filter((t) => t.recordMonth === month);
    const monthBaselines = allBaselines.filter((b) => b.month === month);
    return categoryTotals(monthTx, monthBaselines);
  }, [allTransactions, allBaselines, month]);

  const totalExpense = [...totalsByCategory.values()].reduce((sum, v) => sum + v, 0);
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const balance = totalIncome - totalExpense;

  const trendMonths = useMemo(() => {
    const months: string[] = [];
    for (let i = TREND_MONTHS - 1; i >= 0; i--) months.push(shiftMonth(month, -i));
    return months;
  }, [month]);

  const trendData = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const m of trendMonths) {
      const monthTx = allTransactions.filter((t) => t.recordMonth === m);
      const monthBaselines = allBaselines.filter((b) => b.month === m);
      map.set(m, categoryTotals(monthTx, monthBaselines));
    }
    return map;
  }, [trendMonths, allTransactions, allBaselines]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Báo cáo</h1>
        <label className="flex items-center gap-2 text-sm">
          Tháng
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-2 py-1.5"
          />
          <span className="text-foreground/60">({formatMonthLabel(month)})</span>
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-foreground/50 py-6 text-center">Đang tải...</p>
      ) : (
        <>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm shadow-black/[0.04] dark:shadow-black/30">
            <h2 className="font-medium mb-3">
              Tỉ lệ chi theo hạng mục — {formatMonthLabel(month)}
            </h2>
            <CategoryDonutChart totalsByCategory={totalsByCategory} />
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm shadow-black/[0.04] dark:shadow-black/30">
            <h2 className="font-medium mb-3">Xu hướng chi theo tháng</h2>
            <CategoryTrendChart months={trendMonths} dataByMonth={trendData} />
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-sm shadow-black/[0.04] dark:shadow-black/30 overflow-hidden">
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
                      {totalsByCategory.get(category)
                        ? formatVnd(totalsByCategory.get(category)!)
                        : "–"}
                    </td>
                  </tr>
                ))}
                <tr className="font-medium border-t border-black/10 dark:border-white/10">
                  <td className="p-2">TỔNG CHI</td>
                  <td className="p-2 text-right tabular-nums text-rose-600">
                    {formatVnd(totalExpense)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2">Thu nhập</td>
                  <td className="p-2 text-right tabular-nums text-emerald-600">
                    {formatVnd(totalIncome)}
                  </td>
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
        </>
      )}
    </div>
  );
}
