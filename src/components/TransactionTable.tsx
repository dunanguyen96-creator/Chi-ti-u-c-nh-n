"use client";

import { useRef, useState } from "react";
import { CATEGORIES, CARDS, CATEGORY_ICON, formatVnd, formatMonthShort } from "@/lib/constants";
import { useDebouncedSave } from "@/lib/useDebouncedSave";
import SaveStatusBadge from "@/components/SaveStatusBadge";
import MoneyInput from "@/components/MoneyInput";
import type { Transaction } from "@/lib/types";

const compactTriggerClass =
  "relative inline-flex h-7 w-full items-center justify-center rounded border border-transparent hover:border-black/15 dark:hover:border-white/20";
const compactOverlayClass = "absolute inset-0 h-full w-full cursor-pointer opacity-0";

function CompactMonthInput({
  value,
  onChange,
  title,
}: {
  value: string;
  onChange: (v: string) => void;
  title?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  // A native month input only opens its picker when the click lands on its
  // internal calendar icon, not the digits — so open it explicitly instead
  // of relying on where within the compact label the click happened.
  function openPicker() {
    const el = ref.current;
    if (!el) return;
    el.focus();
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
      } catch {
        // ignore (e.g. not called from a user gesture)
      }
    }
  }

  return (
    <div className={compactTriggerClass}>
      <button
        type="button"
        title={title}
        onClick={openPicker}
        className="absolute inset-0 flex h-full w-full items-center justify-center cursor-pointer bg-transparent"
      >
        <span className="pointer-events-none select-none text-sm tabular-nums">
          {formatMonthShort(value)}
        </span>
      </button>
      <input
        ref={ref}
        type="month"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        title={title}
        tabIndex={-1}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
      />
    </div>
  );
}

function CompactCategorySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={`${compactTriggerClass} w-9`}>
      <span className="pointer-events-none select-none text-base" title={value}>
        {CATEGORY_ICON[value as keyof typeof CATEGORY_ICON] ?? "🔖"}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        title={value}
        className={compactOverlayClass}
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {CATEGORY_ICON[c]} {c}
          </option>
        ))}
      </select>
    </div>
  );
}

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
    <tr className="row-hover border-b border-black/5 dark:border-white/10 align-top">
      <td className="row-hover-edge p-1">
        <input
          type="date"
          value={date}
          onChange={(e) => field(setDate, "date")(e.target.value)}
          className={`${inputClass} w-[104px]`}
        />
      </td>
      <td className="p-1 w-[74px]">
        <CompactMonthInput
          value={recordMonth}
          onChange={field(setRecordMonth, "recordMonth")}
          title="Tháng tính vào báo cáo/thẻ"
        />
      </td>
      <td className="p-1 min-w-[110px]">
        <input
          type="text"
          value={description}
          onChange={(e) => field(setDescription, "description")(e.target.value)}
          className={inputClass}
        />
      </td>
      <td className="p-1 w-24">
        <MoneyInput
          value={amount}
          onChange={field(setAmount, "amount")}
          className={`${inputClass} text-right font-medium`}
        />
      </td>
      <td className="p-1 text-center">
        <CompactCategorySelect value={category} onChange={field(setCategory, "category")} />
      </td>
      <td className="p-1 min-w-[130px]">
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
      <td className="p-1 min-w-[80px]">
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
            <th className="p-1 font-medium text-right">Số tiền</th>
            <th className="p-1 font-medium text-center">Hạng mục</th>
            <th className="p-1 font-medium">Thẻ</th>
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
          <tr className="font-bold border-t border-black/10 dark:border-white/10">
            <td className="p-1.5 whitespace-nowrap" colSpan={3}>
              Tổng ({transactions.length} khoản chi)
            </td>
            <td className="p-1.5 text-right whitespace-nowrap">{formatVnd(total)}</td>
            <td className="p-1.5" colSpan={4}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
