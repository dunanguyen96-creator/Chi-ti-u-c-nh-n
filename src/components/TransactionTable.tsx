"use client";

import { useState } from "react";
import { CATEGORIES, CARDS, formatVnd } from "@/lib/constants";
import { useDebouncedSave } from "@/lib/useDebouncedSave";
import SaveStatusBadge from "@/components/SaveStatusBadge";
import MoneyInput from "@/components/MoneyInput";
import type { Transaction } from "@/lib/types";

function TransactionRow({
  transaction,
  onDeleted,
}: {
  transaction: Transaction;
  onDeleted: (id: string) => void;
}) {
  const [date, setDate] = useState(transaction.date.slice(0, 10));
  const [recordMonth, setRecordMonth] = useState(transaction.recordMonth);
  const [description, setDescription] = useState(transaction.description);
  const [category, setCategory] = useState(transaction.category);
  const [card, setCard] = useState(transaction.card ?? "");
  const [amount, setAmount] = useState(String(transaction.amount));
  const [note, setNote] = useState(transaction.note ?? "");
  const [deleting, setDeleting] = useState(false);

  const { status, trigger } = useDebouncedSave(async (patch: Record<string, unknown>) => {
    const res = await fetch(`/api/transactions/${transaction.id}`, {
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
    if (!confirm(`Xoá khoản chi "${description}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: "DELETE",
      });
      if (res.ok) onDeleted(transaction.id);
    } finally {
      setDeleting(false);
    }
  }

  const inputClass =
    "w-full rounded border border-transparent hover:border-black/15 focus:border-[var(--accent)] dark:hover:border-white/20 bg-transparent px-1.5 py-1 text-sm outline-none";

  return (
    <tr className="border-b border-black/5 dark:border-white/10 align-top">
      <td className="p-1">
        <input
          type="date"
          value={date}
          onChange={(e) => field(setDate, "date")(e.target.value)}
          className={inputClass}
        />
      </td>
      <td className="p-1">
        <input
          type="month"
          value={recordMonth}
          onChange={(e) => field(setRecordMonth, "recordMonth")(e.target.value)}
          title="Tháng tính vào báo cáo/thẻ"
          className={inputClass}
        />
      </td>
      <td className="p-1 min-w-[140px]">
        <input
          type="text"
          value={description}
          onChange={(e) => field(setDescription, "description")(e.target.value)}
          className={inputClass}
        />
      </td>
      <td className="p-1 min-w-[200px]">
        <select
          value={category}
          onChange={(e) => field(setCategory, "category")(e.target.value)}
          className={inputClass}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </td>
      <td className="p-1">
        <select
          value={card}
          onChange={(e) => field(setCard, "card")(e.target.value)}
          className={inputClass}
        >
          <option value="">Cash</option>
          {CARDS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </td>
      <td className="p-1 text-right">
        <MoneyInput
          value={amount}
          onChange={field(setAmount, "amount")}
          className={`${inputClass} text-right`}
        />
      </td>
      <td className="p-1 min-w-[120px]">
        <input
          type="text"
          value={note}
          onChange={(e) => field(setNote, "note")(e.target.value)}
          className={inputClass}
        />
      </td>
      <td className="p-1 whitespace-nowrap">
        <div className="flex items-center gap-2 justify-end">
          <SaveStatusBadge status={status} />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-rose-600 hover:text-rose-700 text-xs px-1.5 py-1 disabled:opacity-50"
            title="Xoá"
          >
            Xoá
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function TransactionTable({
  transactions,
  onDeleted,
}: {
  transactions: Transaction[];
  onDeleted: (id: string) => void;
}) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-foreground/50 py-6 text-center">
        Chưa có khoản chi nào trong khoảng thời gian này.
      </p>
    );
  }

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-foreground/60 border-b border-black/10 dark:border-white/10">
            <th className="p-1 font-medium">Ngày</th>
            <th className="p-1 font-medium">Tháng ghi nhận</th>
            <th className="p-1 font-medium">Chi tiêu</th>
            <th className="p-1 font-medium">Hạng mục</th>
            <th className="p-1 font-medium">Thẻ</th>
            <th className="p-1 font-medium text-right">Số tiền</th>
            <th className="p-1 font-medium">Ghi chú</th>
            <th className="p-1 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <TransactionRow key={t.id} transaction={t} onDeleted={onDeleted} />
          ))}
        </tbody>
        <tfoot>
          <tr className="font-medium border-t border-black/10 dark:border-white/10">
            <td className="p-1.5" colSpan={5}>
              Tổng ({transactions.length} khoản chi)
            </td>
            <td className="p-1.5 text-right">{formatVnd(total)}</td>
            <td colSpan={2}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
