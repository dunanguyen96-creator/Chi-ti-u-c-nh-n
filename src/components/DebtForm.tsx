"use client";

import { useState } from "react";
import type { DebtAccount } from "@/lib/types";

export default function DebtForm({
  onAdded,
}: {
  onAdded: (d: DebtAccount) => void;
}) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên tài khoản / khoản vay");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error("save failed");
      const created = (await res.json()) as DebtAccount;
      onAdded(created);
      setName("");
    } catch {
      setError("Không lưu được, thử lại nhé.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-black/10 dark:border-white/10 p-4 bg-black/[0.02] dark:bg-white/[0.03] flex items-end gap-3 flex-wrap"
    >
      <label className="flex flex-col gap-1 text-sm">
        Tên tài khoản / khoản vay / thẻ
        <input
          type="text"
          placeholder="VD: Thẻ tín dụng VPBank"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          className="rounded-md border border-black/15 dark:border-white/15 bg-transparent px-2 py-1.5 min-w-[240px]"
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-emerald-600 text-white px-4 py-1.5 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
      >
        {submitting ? "Đang lưu..." : "+ Thêm khoản"}
      </button>
      {error && <span className="text-sm text-rose-600">{error}</span>}
    </form>
  );
}
