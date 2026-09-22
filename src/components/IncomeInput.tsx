"use client";

import { useEffect, useState } from "react";
import { useDebouncedSave } from "@/lib/useDebouncedSave";
import SaveStatusBadge from "@/components/SaveStatusBadge";

export default function IncomeInput({
  month,
  initialAmount,
  onSaved,
}: {
  month: string;
  initialAmount: number;
  onSaved: (amount: number) => void;
}) {
  const [amount, setAmount] = useState(String(initialAmount || ""));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync local field when month/amount changes externally
    setAmount(String(initialAmount || ""));
  }, [initialAmount, month]);

  const { status, trigger } = useDebouncedSave(async (value: string) => {
    const res = await fetch("/api/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, amount: Number(value) || 0 }),
    });
    if (!res.ok) throw new Error("save failed");
    onSaved(Number(value) || 0);
  });

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        placeholder="0"
        value={amount}
        onChange={(e) => {
          setAmount(e.target.value);
          trigger(e.target.value);
        }}
        className="w-40 rounded-md border border-black/15 dark:border-white/15 bg-transparent px-2 py-1 text-right"
      />
      <span className="text-sm text-foreground/60">đ</span>
      <SaveStatusBadge status={status} />
    </div>
  );
}
