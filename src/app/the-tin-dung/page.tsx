"use client";

import { useCallback, useEffect, useState } from "react";
import CreditCardCard from "@/components/CreditCardCard";
import { monthKeyFromDate, formatMonthLabel } from "@/lib/constants";
import type { CreditCard, Transaction } from "@/lib/types";

export default function TheTinDungPage() {
  const [month, setMonth] = useState(() => monthKeyFromDate(new Date()));
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (m: string) => {
    setLoading(true);
    const [cardsRes, txRes] = await Promise.all([
      fetch("/api/cards"),
      fetch(`/api/transactions?month=${m}`),
    ]);
    setCards((await cardsRes.json()) as CreditCard[]);
    setTransactions((await txRes.json()) as Transaction[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount/month change
    load(month);
  }, [month, load]);

  function totalForCard(cardName: string) {
    return transactions
      .filter((t) => t.card === cardName)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  function handleUpdated(updated: CreditCard) {
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function handleDeleted(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Thẻ tín dụng</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((c) => (
            <CreditCardCard
              key={c.id}
              card={c}
              monthTotal={totalForCard(c.name)}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
