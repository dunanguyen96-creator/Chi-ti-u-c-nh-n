"use client";

import { useEffect, useState } from "react";
import DebtForm from "@/components/DebtForm";
import DebtCard from "@/components/DebtCard";
import { formatVnd } from "@/lib/constants";
import type { DebtAccount } from "@/lib/types";

export default function NoThePage() {
  const [debts, setDebts] = useState<DebtAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/debts");
      setDebts((await res.json()) as DebtAccount[]);
      setLoading(false);
    }
    load();
  }, []);

  function handleAdded(d: DebtAccount) {
    setDebts((prev) => [...prev, d]);
  }

  function handleDeleted(id: string) {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  }

  const totalRemaining = debts.reduce((s, d) => s + (d.remainingAmount ?? 0), 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Nợ / Thẻ tín dụng</h1>
        {totalRemaining > 0 && (
          <span className="text-sm text-foreground/60">
            Tổng còn nợ:{" "}
            <span className="text-rose-600 font-medium">{formatVnd(totalRemaining)}</span>
          </span>
        )}
      </div>

      <DebtForm onAdded={handleAdded} />

      {loading ? (
        <p className="text-sm text-foreground/50 py-6 text-center">Đang tải...</p>
      ) : debts.length === 0 ? (
        <p className="text-sm text-foreground/50 py-6 text-center">
          Chưa có khoản vay / thẻ tín dụng nào. Thêm khoản đầu tiên ở trên.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {debts.map((d) => (
            <DebtCard key={d.id} debt={d} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}
