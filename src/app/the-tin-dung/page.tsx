"use client";

import { useCallback, useEffect, useState } from "react";
import CreditCardCard from "@/components/CreditCardCard";
import InstallmentManager from "@/components/InstallmentManager";
import LoanManager from "@/components/LoanManager";
import { monthKeyFromDate, formatMonthLabel } from "@/lib/constants";
import type { CreditCard, Transaction, CardBaseline, Installment, Loan } from "@/lib/types";

export default function TheTinDungPage() {
  const [month, setMonth] = useState(() => monthKeyFromDate(new Date()));
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [baselines, setBaselines] = useState<CardBaseline[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (m: string) => {
    setLoading(true);
    const [cardsRes, txRes, baselineRes, installmentRes, loanRes] = await Promise.all([
      fetch("/api/cards"),
      fetch(`/api/transactions?month=${m}`),
      fetch(`/api/card-baselines?month=${m}`),
      fetch("/api/installments"),
      fetch("/api/loans"),
    ]);
    setCards((await cardsRes.json()) as CreditCard[]);
    setTransactions((await txRes.json()) as Transaction[]);
    setBaselines((await baselineRes.json()) as CardBaseline[]);
    setInstallments((await installmentRes.json()) as Installment[]);
    setLoans((await loanRes.json()) as Loan[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount/month change
    load(month);
  }, [month, load]);

  function totalForCard(cardName: string) {
    const baseline = baselines.find((b) => b.card === cardName)?.amount ?? 0;
    const txTotal = transactions
      .filter((t) => t.card === cardName)
      .reduce((sum, t) => sum + t.amount, 0);
    return baseline + txTotal;
  }

  // Installments active this month (tháng bắt đầu <= month <= tháng kết
  // thúc — plain string compare works since months are "YYYY-MM").
  function installmentForCard(cardName: string) {
    return installments
      .filter((i) => i.card === cardName && i.startMonth <= month && month <= i.endMonth)
      .reduce((sum, i) => sum + i.monthlyAmount, 0);
  }

  function expectedBalanceForCard(cardName: string) {
    return totalForCard(cardName) + installmentForCard(cardName);
  }

  function handleUpdated(updated: CreditCard) {
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function handleDeleted(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  function handleInstallmentCreated(installment: Installment) {
    setInstallments((prev) => [installment, ...prev]);
  }

  function handleInstallmentDeleted(id: string) {
    setInstallments((prev) => prev.filter((i) => i.id !== id));
  }

  function handleLoanCreated(loan: Loan) {
    setLoans((prev) => [loan, ...prev]);
  }

  function handleLoanDeleted(id: string) {
    setLoans((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Thẻ tín dụng</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((c) => (
              <CreditCardCard
                key={c.id}
                card={c}
                monthTotal={totalForCard(c.name)}
                expectedBalance={expectedBalanceForCard(c.name)}
                onUpdated={handleUpdated}
                onDeleted={handleDeleted}
              />
            ))}
          </div>

          <InstallmentManager
            installments={installments}
            onCreated={handleInstallmentCreated}
            onDeleted={handleInstallmentDeleted}
          />

          <LoanManager loans={loans} onCreated={handleLoanCreated} onDeleted={handleLoanDeleted} />
        </>
      )}
    </div>
  );
}
