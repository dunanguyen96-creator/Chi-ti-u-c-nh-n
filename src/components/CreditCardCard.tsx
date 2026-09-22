"use client";

import { useState } from "react";
import { useDebouncedSave } from "@/lib/useDebouncedSave";
import SaveStatusBadge from "@/components/SaveStatusBadge";
import MoneyInput from "@/components/MoneyInput";
import { formatVnd } from "@/lib/constants";
import type { CreditCard } from "@/lib/types";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function CreditCardCard({
  card,
  monthLabel,
  monthTotal,
  onUpdated,
  onDeleted,
}: {
  card: CreditCard;
  monthLabel: string;
  monthTotal: number;
  onUpdated: (c: CreditCard) => void;
  onDeleted: (id: string) => void;
}) {
  const [name, setName] = useState(card.name);
  const [cardLimit, setCardLimit] = useState(card.cardLimit != null ? String(card.cardLimit) : "");
  const [installmentAmount, setInstallmentAmount] = useState(
    card.installmentAmount != null ? String(card.installmentAmount) : "",
  );
  const [installmentTerm, setInstallmentTerm] = useState(card.installmentTerm ?? "");
  const [statementClosingDay, setStatementClosingDay] = useState(
    card.statementClosingDay != null ? String(card.statementClosingDay) : "",
  );
  const [paymentDueDay, setPaymentDueDay] = useState(
    card.paymentDueDay != null ? String(card.paymentDueDay) : "",
  );
  const [deleting, setDeleting] = useState(false);

  const { status, trigger } = useDebouncedSave(async (patch: Record<string, unknown>) => {
    const res = await fetch(`/api/cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error("save failed");
  });

  function field<T>(setter: (v: T) => void, key: string) {
    return (value: T) => {
      setter(value);
      trigger({ [key]: value });
    };
  }

  async function handleDelete() {
    if (!confirm(`Xoá thẻ "${name}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/cards/${card.id}`, { method: "DELETE" });
      if (res.ok) onDeleted(card.id);
    } finally {
      setDeleting(false);
    }
  }

  const expectedBalance = monthTotal + (Number(installmentAmount) || 0);

  const [stDate, setStDate] = useState(todayStr());
  const [stBalance, setStBalance] = useState("");
  const [stSubmitting, setStSubmitting] = useState(false);

  async function addStatement(e: React.FormEvent) {
    e.preventDefault();
    if (!stBalance) return;
    setStSubmitting(true);
    try {
      const res = await fetch(`/api/cards/${card.id}/statements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: stDate, balance: Number(stBalance) }),
      });
      if (res.ok) {
        const created = await res.json();
        onUpdated({ ...card, statements: [created, ...card.statements] });
        setStBalance("");
      }
    } finally {
      setStSubmitting(false);
    }
  }

  async function deleteStatement(id: string) {
    const res = await fetch(`/api/cards/${card.id}/statements/${id}`, { method: "DELETE" });
    if (res.ok) onUpdated({ ...card, statements: card.statements.filter((s) => s.id !== id) });
  }

  const [pDate, setPDate] = useState(todayStr());
  const [pAmount, setPAmount] = useState("");
  const [pSubmitting, setPSubmitting] = useState(false);

  async function addPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!pAmount) return;
    setPSubmitting(true);
    try {
      const res = await fetch(`/api/cards/${card.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: pDate, amount: Number(pAmount) }),
      });
      if (res.ok) {
        const created = await res.json();
        onUpdated({ ...card, payments: [created, ...card.payments] });
        setPAmount("");
      }
    } finally {
      setPSubmitting(false);
    }
  }

  async function deletePayment(id: string) {
    const res = await fetch(`/api/cards/${card.id}/payments/${id}`, { method: "DELETE" });
    if (res.ok) onUpdated({ ...card, payments: card.payments.filter((p) => p.id !== id) });
  }

  const inputClass =
    "rounded-md border border-black/15 dark:border-white/15 bg-transparent px-2 py-1.5 text-sm";

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <input
          value={name}
          onChange={(e) => field(setName, "name")(e.target.value)}
          className="font-medium text-base bg-transparent outline-none border-b border-transparent focus:border-emerald-500 px-0.5"
        />
        <div className="flex items-center gap-3">
          <SaveStatusBadge status={status} />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-rose-600 hover:text-rose-700 text-xs disabled:opacity-50"
          >
            Xoá thẻ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <label className="flex flex-col gap-1 text-xs text-foreground/60">
          Hạn mức
          <MoneyInput
            value={cardLimit}
            onChange={field(setCardLimit, "cardLimit")}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-foreground/60">
          Trả góp hàng tháng
          <MoneyInput
            value={installmentAmount}
            onChange={field(setInstallmentAmount, "installmentAmount")}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-foreground/60">
          Kỳ hạn
          <input
            type="text"
            placeholder="VD: 24 tháng"
            value={installmentTerm}
            onChange={(e) => field(setInstallmentTerm, "installmentTerm")(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-foreground/60">
          Ngày chốt sao kê (hàng tháng)
          <input
            type="number"
            min={1}
            max={31}
            placeholder="VD: 22"
            value={statementClosingDay}
            onChange={(e) => field(setStatementClosingDay, "statementClosingDay")(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-foreground/60">
          Ngày thanh toán (hàng tháng)
          <input
            type="number"
            min={1}
            max={31}
            placeholder="VD: 5"
            value={paymentDueDay}
            onChange={(e) => field(setPaymentDueDay, "paymentDueDay")(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <div className="rounded-md bg-black/[0.03] dark:bg-white/[0.05] px-3 py-2 flex items-center justify-between">
        <span className="text-sm text-foreground/60">Dư nợ dự kiến ({monthLabel})</span>
        <span className="font-semibold text-rose-600">{formatVnd(expectedBalance)}</span>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-foreground/80">
          Sao kê ({card.statements.length})
        </summary>
        <div className="mt-2 flex flex-col gap-2">
          {card.statements.length > 0 && (
            <ul className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
              {card.statements.map((s) => (
                <li key={s.id} className="py-1 flex items-center justify-between gap-2">
                  <span>{s.date.slice(0, 10)}</span>
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums">{formatVnd(s.balance)}</span>
                    <button
                      onClick={() => deleteStatement(s.id)}
                      className="text-rose-600 hover:text-rose-700 text-xs"
                    >
                      Xoá
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={addStatement} className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={stDate}
              onChange={(e) => setStDate(e.target.value)}
              className={inputClass}
            />
            <MoneyInput value={stBalance} onChange={setStBalance} className={`${inputClass} w-32`} />
            <button
              type="submit"
              disabled={stSubmitting || !stBalance}
              className="rounded-md bg-emerald-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              + Thêm sao kê
            </button>
          </form>
        </div>
      </details>

      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-foreground/80">
          Lịch sử thanh toán ({card.payments.length})
        </summary>
        <div className="mt-2 flex flex-col gap-2">
          {card.payments.length > 0 && (
            <ul className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
              {card.payments.map((p) => (
                <li key={p.id} className="py-1 flex items-center justify-between gap-2">
                  <span>{p.date.slice(0, 10)}</span>
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums">{formatVnd(p.amount)}</span>
                    <button
                      onClick={() => deletePayment(p.id)}
                      className="text-rose-600 hover:text-rose-700 text-xs"
                    >
                      Xoá
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={addPayment} className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={pDate}
              onChange={(e) => setPDate(e.target.value)}
              className={inputClass}
            />
            <MoneyInput value={pAmount} onChange={setPAmount} className={`${inputClass} w-32`} />
            <button
              type="submit"
              disabled={pSubmitting || !pAmount}
              className="rounded-md bg-emerald-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              + Thêm lịch sử thanh toán
            </button>
          </form>
        </div>
      </details>
    </div>
  );
}
