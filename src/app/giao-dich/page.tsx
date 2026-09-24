"use client";

import { useCallback, useEffect, useState } from "react";
import TransactionForm from "@/components/TransactionForm";
import TransactionTable from "@/components/TransactionTable";
import { CATEGORIES, CATEGORY_ICON, monthKeyFromDate, formatMonthLabel } from "@/lib/constants";
import type { Transaction } from "@/lib/types";

export default function GiaoDichPage() {
  const [month, setMonth] = useState(() => monthKeyFromDate(new Date()));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (m: string) => {
    setLoading(true);
    const res = await fetch(`/api/transactions?month=${m}`);
    const data = (await res.json()) as Transaction[];
    setTransactions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount/month change
    load(month);
  }, [month, load]);

  function handleAdded(t: Transaction) {
    // Newly entered expenses always land at the very top, regardless of date.
    if (t.recordMonth === month) {
      setTransactions((prev) => [t, ...prev]);
    }
  }

  function handleDeleted(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  const filteredTransactions = categoryFilter
    ? transactions.filter((t) => t.category === categoryFilter)
    : transactions;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Khoản chi</h1>
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

      <TransactionForm onAdded={handleAdded} />

      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm shadow-black/[0.04] dark:shadow-black/30">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <h2 className="font-medium">Danh sách khoản chi</h2>
          <label className="flex items-center gap-2 text-sm">
            Lọc theo hạng mục
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-2 py-1.5"
            >
              <option value="">Tất cả</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_ICON[c]} {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        {loading ? (
          <p className="text-sm text-foreground/50 py-6 text-center">Đang tải...</p>
        ) : (
          <TransactionTable transactions={filteredTransactions} onDeleted={handleDeleted} />
        )}
      </div>
    </div>
  );
}
