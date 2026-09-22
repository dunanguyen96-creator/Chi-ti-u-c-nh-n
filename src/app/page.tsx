"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import IncomeInput from "@/components/IncomeInput";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import { monthKeyFromDate, formatMonthLabel, formatVnd } from "@/lib/constants";
import type { Transaction } from "@/lib/types";

export default function DashboardPage() {
  const [month, setMonth] = useState(() => monthKeyFromDate(new Date()));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [income, setIncome] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (m: string) => {
    setLoading(true);
    const [txRes, incomeRes] = await Promise.all([
      fetch(`/api/transactions?month=${m}`),
      fetch(`/api/income`),
    ]);
    const tx = (await txRes.json()) as Transaction[];
    const incomes = (await incomeRes.json()) as { month: string; amount: number }[];
    setTransactions(tx);
    setIncome(incomes.find((i) => i.month === m)?.amount ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount/month change
    load(month);
  }, [month, load]);

  const totalExpense = transactions.reduce((sum, t) => sum + t.amount, 0);
  const balance = income - totalExpense;
  const recent = transactions.slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Tổng quan</h1>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 flex flex-col gap-2">
          <span className="text-sm text-foreground/60">Thu nhập</span>
          <IncomeInput month={month} initialAmount={income} onSaved={setIncome} />
        </div>
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 flex flex-col gap-1">
          <span className="text-sm text-foreground/60">Tổng chi</span>
          <span className="text-2xl font-semibold text-rose-600">
            {formatVnd(totalExpense)}
          </span>
        </div>
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 flex flex-col gap-1">
          <span className="text-sm text-foreground/60">Chênh lệch</span>
          <span
            className={`text-2xl font-semibold ${
              balance >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {formatVnd(balance)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
          <h2 className="font-medium mb-3">Chi tiêu theo hạng mục</h2>
          {loading ? (
            <p className="text-sm text-foreground/50 py-6 text-center">Đang tải...</p>
          ) : (
            <CategoryBreakdown transactions={transactions} />
          )}
        </div>

        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium">Giao dịch gần đây</h2>
            <Link
              href="/giao-dich"
              className="text-sm text-emerald-600 hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-foreground/50 py-6 text-center">Đang tải...</p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-foreground/50 py-6 text-center">
              Chưa có giao dịch nào trong tháng này.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
              {recent.map((t) => (
                <li key={t.id} className="py-2 flex justify-between gap-2 text-sm">
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
