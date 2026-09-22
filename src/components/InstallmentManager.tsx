"use client";

import { useState } from "react";
import MoneyInput from "@/components/MoneyInput";
import { CARDS, formatMonthLabel, formatVnd, monthKeyFromDate } from "@/lib/constants";
import type { Installment } from "@/lib/types";

const inputClass =
  "rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-2 py-1.5 text-sm";

export default function InstallmentManager({
  installments,
  onCreated,
  onDeleted,
}: {
  installments: Installment[];
  onCreated: (installment: Installment) => void;
  onDeleted: (id: string) => void;
}) {
  const [card, setCard] = useState<string>(CARDS[0]);
  const [totalAmount, setTotalAmount] = useState("");
  const [startMonth, setStartMonth] = useState(() => monthKeyFromDate(new Date()));
  const [endMonth, setEndMonth] = useState(() => monthKeyFromDate(new Date()));
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!totalAmount || !monthlyAmount) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/installments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card,
          totalAmount: Number(totalAmount),
          startMonth,
          endMonth,
          monthlyAmount: Number(monthlyAmount),
        }),
      });
      if (res.ok) {
        const created = (await res.json()) as Installment;
        onCreated(created);
        setTotalAmount("");
        setMonthlyAmount("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/installments/${id}`, { method: "DELETE" });
    if (res.ok) onDeleted(id);
  }

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm shadow-black/[0.04] dark:shadow-black/30 overflow-x-auto">
      <h2 className="font-medium mb-3">Quản lý trả góp</h2>

      {installments.length > 0 && (
        <table className="w-full text-sm border-collapse mb-3">
          <thead>
            <tr className="text-left text-foreground/60 border-b border-black/10 dark:border-white/10">
              <th className="p-2 font-medium">Tên thẻ</th>
              <th className="p-2 font-medium text-right">Số tiền trả góp</th>
              <th className="p-2 font-medium text-right">Tháng bắt đầu</th>
              <th className="p-2 font-medium text-right">Tháng kết thúc</th>
              <th className="p-2 font-medium text-right">Trả hàng tháng</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {installments.map((i) => (
              <tr key={i.id} className="border-b border-black/5 dark:border-white/10">
                <td className="p-2 whitespace-nowrap">{i.card}</td>
                <td className="p-2 text-right tabular-nums whitespace-nowrap">
                  {formatVnd(i.totalAmount)}
                </td>
                <td className="p-2 text-right whitespace-nowrap">{formatMonthLabel(i.startMonth)}</td>
                <td className="p-2 text-right whitespace-nowrap">{formatMonthLabel(i.endMonth)}</td>
                <td className="p-2 text-right tabular-nums whitespace-nowrap">
                  {formatVnd(i.monthlyAmount)}
                </td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => handleDelete(i.id)}
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
          Tên thẻ
          <select value={card} onChange={(e) => setCard(e.target.value)} className={inputClass}>
            {CARDS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-0.5 text-xs text-foreground/60">
          Số tiền trả góp
          <MoneyInput value={totalAmount} onChange={setTotalAmount} className={`${inputClass} w-32`} />
        </label>
        <label className="flex flex-col gap-0.5 text-xs text-foreground/60">
          Tháng bắt đầu
          <input
            type="month"
            value={startMonth}
            onChange={(e) => setStartMonth(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-0.5 text-xs text-foreground/60">
          Tháng kết thúc
          <input
            type="month"
            value={endMonth}
            onChange={(e) => setEndMonth(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-0.5 text-xs text-foreground/60">
          Trả hàng tháng
          <MoneyInput value={monthlyAmount} onChange={setMonthlyAmount} className={`${inputClass} w-32`} />
        </label>
        <button
          type="submit"
          disabled={submitting || !totalAmount || !monthlyAmount}
          className="rounded-lg bg-[var(--accent)] text-white px-3 py-1.5 text-xs font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          + Thêm trả góp
        </button>
      </form>
    </div>
  );
}
