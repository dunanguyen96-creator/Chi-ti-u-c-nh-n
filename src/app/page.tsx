"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import IncomeList from "@/components/IncomeList";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import { monthKeyFromDate, formatMonthLabel, formatVnd } from "@/lib/constants";
import { categoryTotals } from "@/lib/reportUtils";
import type { Transaction, Income, CategoryBaseline } from "@/lib/types";

export default function DashboardPage() {
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

  const totalExpense = [...categoryTotals(transactions, baselines).values()].reduce(
    (sum, v) => sum + v,
    0,
  );
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const balance = totalIncome - totalExpense;
  const recent = transactions.slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Tổng quan</h1>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm shadow-black/[0.04] dark:shadow-black/30 flex flex-col gap-2 sm:col-span-1">
          <span className="text-sm text-foreground/60">Thu nhập</span>
          <IncomeList
            month={month}
            incomes={incomes}
            onAdded={(i) => setIncomes((prev) => [i, ...prev])}
            onDeleted={(id) => setIncomes((prev) => prev.filter((i) => i.id !== id))}
          />
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm shadow-black/[0.04] dark:shadow-black/30 flex flex-col gap-1">
          <span className="text-sm text-foreground/60">Tổng chi</span>
          <span className="text-3xl font-bold text-rose-600">
            {formatVnd(totalExpense)}
          </span>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm shadow-black/[0.04] dark:shadow-black/30 flex flex-col gap-1">
          <span className="text-sm text-foreground/60">Chênh lệch</span>
          <span
            className={`text-3xl font-bold ${
              balance >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {formatVnd(balance)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm shadow-black/[0.04] dark:shadow-black/30">
          <h2 className="font-medium mb-3">Chi tiêu theo hạng mục</h2>
          {loading ? (
            <p className="text-sm text-foreground/50 py-6 text-center">Đang tải...</p>
          ) : (
            <CategoryBreakdown transactions={transactions} baselines={baselines} />
          )}
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm shadow-black/[0.04] dark:shadow-black/30">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">Khoản chi gần đây</h2>
            <Link
              href="/giao-dich"
              className="text-sm text-[var(--accent)] hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-foreground/50 py-6 text-center">Đang tải...</p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-foreground/50 py-6 text-center">
              Chưa có khoản chi nào trong tháng này.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
              {recent.map((t) => (
                <li
                  key={t.id}
                  className="row-hover row-hover-edge py-2 px-2 -mx-2 flex justify-between gap-2 text-sm"
                >
                  <div className="flex flex-col">
                    <span>{t.description}</span>
                    <span className="text-xs text-foreground/50">{t.category}</span>
                  </div>
                  <span className="tabular-nums shrink-0">{formatVnd(t.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
