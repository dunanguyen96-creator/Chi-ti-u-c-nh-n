"use client";

import { useState } from "react";
import MoneyInput from "@/components/MoneyInput";
import { formatVnd, formatDateDMY, todayStr } from "@/lib/constants";
import type { Loan } from "@/lib/types";

const inputClass =
  "rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-2 py-1.5 text-sm";

export default function LoanManager({
  loans,
  onCreated,
  onDeleted,
}: {
  loans: Loan[];
  onCreated: (loan: Loan) => void;
  onDeleted: (id: string) => void;
}) {
  const [description, setDescription] = useState("");
  const [loanDate, setLoanDate] = useState(todayStr());
  const [termMonths, setTermMonths] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");
  const [paymentDay, setPaymentDay] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description || !termMonths || !interestRate || !monthlyPayment) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          loanDate,
          termMonths: Number(termMonths),
          interestRate: Number(interestRate),
          monthlyPayment: Number(monthlyPayment),
          paymentDay: paymentDay ? Number(paymentDay) : null,
        }),
      });
      if (res.ok) {
        const created = (await res.json()) as Loan;
        onCreated(created);
        setDescription("");
        setTermMonths("");
        setInterestRate("");
        setMonthlyPayment("");
        setPaymentDay("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/loans/${id}`, { method: "DELETE" });
    if (res.ok) onDeleted(id);
  }

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm shadow-black/[0.04] dark:shadow-black/30 overflow-x-auto">
      <h2 className="font-medium mb-3">Quản lý khoản vay</h2>

      {loans.length > 0 && (
        <table className="w-full text-sm border-collapse mb-3">
          <thead>
            <tr className="text-left text-foreground/60 border-b border-black/10 dark:border-white/10">
              <th className="p-2 font-medium">TT khoản vay</th>
              <th className="p-2 font-medium text-right">Ngày vay</th>
              <th className="p-2 font-medium text-right">Kỳ hạn</th>
              <th className="p-2 font-medium text-right">Lãi suất</th>
              <th className="p-2 font-medium text-right">Ngày TT hàng tháng</th>
              <th className="p-2 font-medium text-right">Tổng trả hàng tháng</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {loans.map((l) => (
              <tr key={l.id} className="row-hover border-b border-black/5 dark:border-white/10">
                <td className="row-hover-edge p-2 whitespace-nowrap">{l.description}</td>
                <td className="p-2 text-right whitespace-nowrap">{formatDateDMY(l.loanDate)}</td>
                <td className="p-2 text-right whitespace-nowrap">{l.termMonths} tháng</td>
                <td className="p-2 text-right whitespace-nowrap">{l.interestRate}%</td>
                <td className="p-2 text-right whitespace-nowrap">
                  {l.paymentDay ? `Ngày ${l.paymentDay}` : "–"}
                </td>
                <td className="p-2 text-right tabular-nums font-medium whitespace-nowrap">
                  {formatVnd(l.monthlyPayment)}
                </td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => handleDelete(l.id)}
                    className="text-rose-600 hover:text-rose-700 text-xs"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 flex-wrap">
        <label className="flex flex-col gap-0.5 text-xs text-foreground/60">
          TT khoản vay
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Vay ai/ ở đâu..."
            className={`${inputClass} w-40`}
          />
        </label>
        <label className="flex flex-col gap-0.5 text-xs text-foreground/60">
          Ngày vay
          <input
            type="date"
            value={loanDate}
            onChange={(e) => setLoanDate(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-0.5 text-xs text-foreground/60">
          Kỳ hạn (tháng)
          <input
            type="number"
            value={termMonths}
            onChange={(e) => setTermMonths(e.target.value)}
            placeholder="0"
            className={`${inputClass} w-20`}
          />
        </label>
        <label className="flex flex-col gap-0.5 text-xs text-foreground/60">
          Lãi suất (%)
          <input
            type="number"
            step="0.01"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="0"
            className={`${inputClass} w-20`}
          />
        </label>
        <label className="flex flex-col gap-0.5 text-xs text-foreground/60">
          Ngày TT hàng tháng
          <input
            type="number"
            min={1}
            max={28}
            value={paymentDay}
            onChange={(e) => setPaymentDay(e.target.value)}
            placeholder="VD: 15"
            className={`${inputClass} w-24`}
          />
        </label>
        <label className="flex flex-col gap-0.5 text-xs text-foreground/60">
          Tổng trả hàng tháng
          <MoneyInput
            value={monthlyPayment}
            onChange={setMonthlyPayment}
            className={`${inputClass} w-32`}
          />
        </label>
        <button
          type="submit"
          disabled={submitting || !description || !termMonths || !interestRate || !monthlyPayment}
          className="rounded-lg bg-[var(--accent)] text-white px-3 py-1.5 text-xs font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          + Thêm khoản vay
        </button>
      </form>
    </div>
  );
}
