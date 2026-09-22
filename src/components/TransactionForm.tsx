"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORIES, CARDS, monthKeyFromDate } from "@/lib/constants";
import MoneyInput from "@/components/MoneyInput";
import type { Transaction } from "@/lib/types";

const DRAFT_KEY = "chi-tieu:draft-transaction";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

interface Draft {
  date: string;
  recordMonth: string;
  description: string;
  category: string;
  card: string;
  amount: string;
  note: string;
}

function emptyDraft(): Draft {
  const date = todayStr();
  return {
    date,
    recordMonth: monthKeyFromDate(date),
    description: "",
    category: CATEGORIES[0],
    card: "",
    amount: "",
    note: "",
  };
}

export default function TransactionForm({
  onAdded,
}: {
  onAdded: (t: Transaction) => void;
}) {
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const recordMonthManual = useRef(false);

  // Restore any unsaved draft so nothing typed is lost on navigation/reload.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Draft>;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restore locally saved draft on mount
        setDraft((d) => ({ ...d, ...parsed }));
        if (parsed.recordMonth) recordMonthManual.current = true;
        if (parsed.description || parsed.amount) setRestored(true);
      }
    } catch {
      // ignore corrupted draft
    }
  }, []);

  // Persist draft locally on every keystroke so it survives accidental navigation.
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // ignore write failures (e.g. private browsing)
    }
  }, [draft]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setError(null);
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function updateDate(value: string) {
    setError(null);
    setDraft((d) => ({
      ...d,
      date: value,
      recordMonth: recordMonthManual.current ? d.recordMonth : monthKeyFromDate(value),
    }));
  }

  function updateRecordMonth(value: string) {
    recordMonthManual.current = true;
    update("recordMonth", value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.description.trim() || !draft.amount) {
      setError("Vui lòng nhập mô tả và số tiền");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: draft.date,
          recordMonth: draft.recordMonth,
          description: draft.description.trim(),
          category: draft.category,
          card: draft.card || null,
          amount: Number(draft.amount),
          note: draft.note.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Lỗi khi lưu");
      const created = (await res.json()) as Transaction;
      onAdded(created);
      const next = emptyDraft();
      next.category = draft.category;
      next.card = draft.card;
      recordMonthManual.current = false;
      setDraft(next);
      setRestored(false);
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      setError("Không lưu được giao dịch, thử lại nhé.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-black/10 dark:border-white/10 p-4 bg-black/[0.02] dark:bg-white/[0.03]"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-medium">Thêm giao dịch</h2>
        {restored && (
          <span className="text-xs text-amber-600">
            Đã khôi phục nội dung chưa lưu
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Ngày
          <input
            type="date"
            required
            value={draft.date}
            onChange={(e) => updateDate(e.target.value)}
            className="rounded-md border border-black/15 dark:border-white/15 bg-transparent px-2 py-1.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Tháng ghi nhận
          <input
            type="month"
            required
            value={draft.recordMonth}
            onChange={(e) => updateRecordMonth(e.target.value)}
            title="Tháng tính vào báo cáo/thẻ (VD chi tháng 9 nhưng ghi nhận tháng 10)"
            className="rounded-md border border-black/15 dark:border-white/15 bg-transparent px-2 py-1.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          Mô tả
          <input
            type="text"
            required
            placeholder="VD: Bún cá"
            value={draft.description}
            onChange={(e) => update("description", e.target.value)}
            className="rounded-md border border-black/15 dark:border-white/15 bg-transparent px-2 py-1.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Số tiền (đ)
          <MoneyInput
            value={draft.amount}
            onChange={(v) => update("amount", v)}
            className="rounded-md border border-black/15 dark:border-white/15 bg-transparent px-2 py-1.5"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Hạng mục
          <select
            value={draft.category}
            onChange={(e) => update("category", e.target.value)}
            className="rounded-md border border-black/15 dark:border-white/15 bg-transparent px-2 py-1.5"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Thẻ trả sau
          <select
            value={draft.card}
            onChange={(e) => update("card", e.target.value)}
            className="rounded-md border border-black/15 dark:border-white/15 bg-transparent px-2 py-1.5"
          >
            <option value="">Cash</option>
            {CARDS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm md:col-span-2">
          Ghi chú
          <input
            type="text"
            placeholder="Không bắt buộc"
            value={draft.note}
            onChange={(e) => update("note", e.target.value)}
            className="rounded-md border border-black/15 dark:border-white/15 bg-transparent px-2 py-1.5"
          />
        </label>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-emerald-600 text-white px-4 py-1.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? "Đang lưu..." : "+ Thêm giao dịch"}
        </button>
        {error && <span className="text-sm text-rose-600">{error}</span>}
        <span className="text-xs text-foreground/50">
          Nội dung đang nhập được tự động lưu tạm trên trình duyệt
        </span>
      </div>
    </form>
  );
}
