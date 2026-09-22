"use client";

import { useCallback, useEffect, useState } from "react";
import TransactionForm from "@/components/TransactionForm";
import TransactionTable from "@/components/TransactionTable";
import { monthKeyFromDate, formatMonthLabel } from "@/lib/constants";
import type { Transaction } from "@/lib/types";

export default function GiaoDichPage() {
  const [month, setMonth] = useState(() => monthKeyFromDate(new Date()));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
    if (t.recordMonth === month) {
      setTransactions((prev) =>
        [t, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1)),
      );
    }
  }

  function handleDeleted(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Giao dịch</h1>
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

      <TransactionForm onAdded={handleAdded} />

      <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
        <h2 className="font-medium mb-3">
          Danh sách giao dịch — sửa trực tiếp, tự động lưu
        </h2>
        {loading ? (
          <p className="text-sm text-foreground/50 py-6 text-center">Đang tải...</p>
        ) : (
          <TransactionTable transactions={transactions} onDeleted={handleDeleted} />
        )}
      </div>
    </div>
  );
}
