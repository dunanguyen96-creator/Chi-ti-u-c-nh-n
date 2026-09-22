"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, monthKeyFromDate, formatMonthLabel, formatVnd, shiftMonth } from "@/lib/constants";
import { categoryTotals } from "@/lib/reportUtils";
import CategoryDonutChart from "@/components/CategoryDonutChart";
import CategoryTrendChart from "@/components/CategoryTrendChart";
import type { Transaction, Income, CategoryBaseline } from "@/lib/types";

const TREND_MONTHS = 6;

export default function BaoCaoPage() {
  const [donutMonth, setDonutMonth] = useState(() => monthKeyFromDate(new Date()));
  const [tableMonth, setTableMonth] = useState(() => monthKeyFromDate(new Date()));
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [allBaselines, setAllBaselines] = useState<CategoryBaseline[]>([]);
  const [incomeByMonth, setIncomeByMonth] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  const loadedIncomeMonths = useRef(new Set<string>());

  const loadIncome = useCallback(async (m: string) => {
    if (loadedIncomeMonths.current.has(m)) return;
    loadedIncomeMonths.current.add(m);
    const res = await fetch(`/api/income?month=${m}`);
    const data = (await res.json()) as Income[];
    setIncomeByMonth((prev) => {
      const next = new Map(prev);
      next.set(m, data.reduce((sum, i) => sum + i.amount, 0));
      return next;
    });
  }, []);

  // Transactions/baselines are fetched once in full: the donut and the
  // table each pick their own month, and this app's data volume is small
  // enough that filtering client-side avoids extra range-query APIs.
  useEffect(() => {
    async function loadInitial() {
      const [txRes, baselineRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/category-baselines"),
      ]);
      setAllTransactions((await txRes.json()) as Transaction[]);
      setAllBaselines((await baselineRes.json()) as CategoryBaseline[]);
      await Promise.all([loadIncome(donutMonth), loadIncome(tableMonth)]);
      setLoading(false);
    }
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only, runs once
  }, []);

  useEffect(() => {
    loadIncome(donutMonth);
  }, [donutMonth, loadIncome]);

  useEffect(() => {
    loadIncome(tableMonth);
  }, [tableMonth, loadIncome]);

  const totalsByCategory = useMemo(() => {
    const monthTx = allTransactions.filter((t) => t.recordMonth === donutMonth);
    const monthBaselines = allBaselines.filter((b) => b.month === donutMonth);
    return categoryTotals(monthTx, monthBaselines);
  }, [allTransactions, allBaselines, donutMonth]);

  const tableTotalsByCategory = useMemo(() => {
    const monthTx = allTransactions.filter((t) => t.recordMonth === tableMonth);
    const monthBaselines = allBaselines.filter((b) => b.month === tableMonth);
    return categoryTotals(monthTx, monthBaselines);
  }, [allTransactions, allBaselines, tableMonth]);

  const tableTotalExpense = [...tableTotalsByCategory.values()].reduce((sum, v) => sum + v, 0);
  const tableTotalIncome = incomeByMonth.get(tableMonth) ?? 0;
  const tableBalance = tableTotalIncome - tableTotalExpense;

  const trendMonths = useMemo(() => {
    const months: string[] = [];
    for (let i = TREND_MONTHS - 1; i >= 0; i--) months.push(shiftMonth(donutMonth, -i));
    return months;
  }, [donutMonth]);

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
      <h1 className="text-2xl font-semibold tracking-tight">Báo cáo</h1>

      {loading ? (
        <p className="text-sm text-foreground/50 py-6 text-center">Đang tải...</p>
      ) : (
        <>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm shadow-black/[0.04] dark:shadow-black/30">
            <h2 className="font-medium mb-3">Tỉ lệ chi theo hạng mục</h2>
            <CategoryDonutChart
              totalsByCategory={totalsByCategory}
              month={donutMonth}
              onMonthChange={setDonutMonth}
            />
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm shadow-black/[0.04] dark:shadow-black/30">
            <h2 className="font-medium mb-3">Xu hướng chi theo tháng</h2>
            <CategoryTrendChart months={trendMonths} dataByMonth={trendData} />
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-sm shadow-black/[0.04] dark:shadow-black/30 overflow-hidden">
            <div className="p-4 pb-0">
              <label className="flex items-center gap-2 text-sm self-start">
                Tháng
                <input
                  type="month"
                  value={tableMonth}
                  onChange={(e) => setTableMonth(e.target.value)}
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-2 py-1.5"
                />
                <span className="text-foreground/60">({formatMonthLabel(tableMonth)})</span>
              </label>
            </div>
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
                      {tableTotalsByCategory.get(category)
                        ? formatVnd(tableTotalsByCategory.get(category)!)
                        : "–"}
                    </td>
                  </tr>
                ))}
                <tr className="font-medium border-t border-black/10 dark:border-white/10">
                  <td className="p-2">TỔNG CHI</td>
                  <td className="p-2 text-right tabular-nums text-rose-600">
                    {formatVnd(tableTotalExpense)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2">Thu nhập</td>
                  <td className="p-2 text-right tabular-nums text-emerald-600">
                    {formatVnd(tableTotalIncome)}
                  </td>
                </tr>
                <tr className="font-medium border-t border-black/10 dark:border-white/10">
                  <td className="p-2">Chênh lệch</td>
                  <td
                    className={`p-2 text-right tabular-nums ${
                      tableBalance >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {formatVnd(tableBalance)}
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
