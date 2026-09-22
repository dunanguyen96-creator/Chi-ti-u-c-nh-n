"use client";

import { useState } from "react";
import MoneyInput from "@/components/MoneyInput";
import { formatVnd } from "@/lib/constants";
import type { Income } from "@/lib/types";

export default function IncomeList({
  month,
  incomes,
  onAdded,
  onDeleted,
}: {
  month: string;
  incomes: Income[];
  onAdded: (i: Income) => void;
  onDeleted: (id: string) => void;
}) {
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = incomes.reduce((sum, i) => sum + i.amount, 0);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, amount: Number(amount), note: note.trim() || null }),
      });
      if (res.ok) {
        const created = (await res.json()) as Income;
        onAdded(created);
        setNote("");
        setAmount("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/income/${id}`, { method: "DELETE" });
    if (res.ok) onDeleted(id);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-3xl font-bold text-emerald-600">{formatVnd(total)}</span>

      {incomes.length > 0 && (
        <ul className="flex flex-col divide-y divide-black/5 dark:divide-white/10 text-sm">
          {incomes.map((i) => (
            <li key={i.id} className="py-1.5 flex items-center justify-between gap-2">
              <span className="text-foreground/70 truncate">{i.note || "Thu nhập"}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="tabular-nums">{formatVnd(i.amount)}</span>
                <button
                  onClick={() => handleDelete(i.id)}
                  className="text-rose-600 hover:text-rose-700 text-xs"
                  title="Xoá"
                >
                  Xoá
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex items-center gap-2 flex-wrap mt-1">
        <input
          type="text"
          placeholder="Loại thu nhập (VD: Lương)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="flex-1 min-w-[120px] rounded-lg border border-[var(--card-border)] bg-transparent px-2 py-1 text-sm"
        />
        <MoneyInput
          value={amount}
          onChange={setAmount}
          className="w-28 rounded-lg border border-[var(--card-border)] bg-transparent px-2 py-1 text-sm text-right"
        />
        <button
          type="submit"
          disabled={submitting || !amount}
          className="rounded-lg bg-[var(--accent)] text-white px-3 py-1 text-sm font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          + Thêm khoản thu
        </button>
      </form>
    </div>
  );
}
