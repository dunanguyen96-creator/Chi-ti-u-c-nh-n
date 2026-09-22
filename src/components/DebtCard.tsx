"use client";

import { useState } from "react";
import { useDebouncedSave } from "@/lib/useDebouncedSave";
import SaveStatusBadge from "@/components/SaveStatusBadge";
import { formatVnd } from "@/lib/constants";
import type { DebtAccount } from "@/lib/types";

function toStr(v: number | null) {
  return v === null || v === undefined ? "" : String(v);
}

export default function DebtCard({
  debt,
  onDeleted,
}: {
  debt: DebtAccount;
  onDeleted: (id: string) => void;
}) {
  const [name, setName] = useState(debt.name);
  const [monthlyRate, setMonthlyRate] = useState(toStr(debt.monthlyInterestRate));
  const [yearlyRate, setYearlyRate] = useState(toStr(debt.yearlyInterestRate));
  const [serviceFee, setServiceFee] = useState(debt.serviceFee ?? "");
  const [borrowed, setBorrowed] = useState(toStr(debt.borrowedAmount));
  const [remaining, setRemaining] = useState(toStr(debt.remainingAmount));
  const [limit, setLimit] = useState(toStr(debt.availableLimit));
  const [closingDay, setClosingDay] = useState(toStr(debt.interestClosingDay));
  const [paymentDay, setPaymentDay] = useState(toStr(debt.paymentDay));
  const [cashback, setCashback] = useState(debt.cashbackPolicy ?? "");
  const [note, setNote] = useState(debt.note ?? "");
  const [deleting, setDeleting] = useState(false);

  const { status, trigger } = useDebouncedSave(async (patch: Record<string, unknown>) => {
    const res = await fetch(`/api/debts/${debt.id}`, {
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
    if (!confirm(`Xoá "${name}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/debts/${debt.id}`, { method: "DELETE" });
      if (res.ok) onDeleted(debt.id);
    } finally {
      setDeleting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-2 py-1.5 text-sm";
  const remainingNum = Number(remaining) || 0;
  const limitNum = Number(limit) || 0;

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
            Xoá
          </button>
        </div>
      </div>

      {(remainingNum > 0 || limitNum > 0) && (
        <div className="text-sm text-foreground/60">
          Còn nợ <span className="text-rose-600 font-medium">{formatVnd(remainingNum)}</span>
          {limitNum > 0 && (
            <>
              {" "}
              · Hạn mức còn dùng{" "}
              <span className="text-emerald-600 font-medium">{formatVnd(limitNum)}</span>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <label className="flex flex-col gap-1 text-xs text-foreground/60">
          Lãi/tháng (%)
          <input
            type="number"
            step="0.01"
            value={monthlyRate}
            onChange={(e) => field(setMonthlyRate, "monthlyInterestRate")(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-foreground/60">
          Lãi/năm (%)
          <input
            type="number"
            step="0.01"
            value={yearlyRate}
            onChange={(e) => field(setYearlyRate, "yearlyInterestRate")(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-foreground/60">
          Phí dịch vụ
          <input
            type="text"
            value={serviceFee}
            onChange={(e) => field(setServiceFee, "serviceFee")(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-foreground/60">
          Đã vay / tiêu dùng (đ)
          <input
            type="number"
            value={borrowed}
            onChange={(e) => field(setBorrowed, "borrowedAmount")(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-foreground/60">
          Còn phải trả (đ)
          <input
            type="number"
            value={remaining}
            onChange={(e) => field(setRemaining, "remainingAmount")(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-foreground/60">
          Hạn mức còn lại (đ)
          <input
            type="number"
            value={limit}
            onChange={(e) => field(setLimit, "availableLimit")(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-foreground/60">
          Ngày chốt lãi
          <input
            type="number"
            min={1}
            max={31}
            value={closingDay}
            onChange={(e) => field(setClosingDay, "interestClosingDay")(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-foreground/60">
          Ngày thanh toán
          <input
            type="number"
            min={1}
            max={31}
            value={paymentDay}
            onChange={(e) => field(setPaymentDay, "paymentDay")(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-foreground/60 col-span-2">
          Chính sách hoàn tiền
          <input
            type="text"
            value={cashback}
            onChange={(e) => field(setCashback, "cashbackPolicy")(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-foreground/60 col-span-2">
          Ghi chú
          <input
            type="text"
            value={note}
            onChange={(e) => field(setNote, "note")(e.target.value)}
            className={inputClass}
          />
        </label>
      </div>
    </div>
  );
}
