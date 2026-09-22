"use client";

import { useEffect, useRef, useState } from "react";
import { useDebouncedSave } from "@/lib/useDebouncedSave";
import SaveStatusBadge from "@/components/SaveStatusBadge";
import MoneyInput from "@/components/MoneyInput";
import { formatVnd } from "@/lib/constants";
import { cardTheme } from "@/lib/cardThemes";
import type { CreditCard, CardStatement, CardPayment } from "@/lib/types";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Days from today to dateStr (negative when dateStr is in the past).
function daysUntil(dateStr: string): number {
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

const inputClass =
  "rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-2 py-1.5 text-sm";

function StatementRow({
  cardId,
  statement,
  remaining,
  onDeleted,
}: {
  cardId: string;
  statement: CardStatement;
  remaining: number;
  onDeleted: (id: string) => void;
}) {
  const owing = remaining > 0;
  const urgent = owing && Boolean(statement.dueDate) && daysUntil(statement.dueDate!) <= 3;
  const pending = owing && !urgent;

  const rowTone = urgent
    ? "bg-rose-50 dark:bg-rose-950/40"
    : pending
      ? "bg-amber-50 dark:bg-amber-950/20"
      : "";
  const badgeTone = urgent
    ? "bg-rose-600 text-white"
    : pending
      ? "bg-amber-500 text-white"
      : "bg-emerald-600 text-white";

  async function handleDelete() {
    const res = await fetch(`/api/cards/${cardId}/statements/${statement.id}`, {
      method: "DELETE",
    });
    if (res.ok) onDeleted(statement.id);
  }

  return (
    <li
      className={`row-hover row-hover-edge py-2 px-2 -mx-2 rounded-md flex items-center justify-between gap-2 flex-wrap ${rowTone}`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-foreground/50">{statement.date.slice(0, 10)}</span>
        <span className={`tabular-nums ${owing ? "font-bold text-base" : ""}`}>
          {formatVnd(statement.balance)}
        </span>
        {owing && remaining !== statement.balance && (
          <span className="text-xs text-foreground/50">(còn lại {formatVnd(remaining)})</span>
        )}
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${badgeTone}`}>
          {!owing
            ? "Đã trả hết"
            : statement.dueDate
              ? `Hạn TT ${statement.dueDate.slice(0, 10)}${urgent ? " · Gấp!" : ""}`
              : "Chưa có hạn TT"}
        </span>
      </div>
      <button onClick={handleDelete} className="text-rose-600 hover:text-rose-700 text-xs">
        Xoá
      </button>
    </li>
  );
}

export default function CreditCardCard({
  card,
  monthTotal,
  expectedBalance,
  onUpdated,
  onDeleted,
}: {
  card: CreditCard;
  monthTotal: number;
  expectedBalance: number;
  onUpdated: (c: CreditCard) => void;
  onDeleted: (id: string) => void;
}) {
  const [name, setName] = useState(card.name);
  const [deleting, setDeleting] = useState(false);
  const theme = cardTheme(card.name);

  // Overdraft-style account (e.g. "Mycash thấu chi"): no statement cycle —
  // show Hạn mức/Dư nợ/Khả dụng instead, with Dư nợ reduced by payments.
  const isOverdraft = card.creditLimit != null;
  const totalPayments = card.payments.reduce((sum, p) => sum + p.amount, 0);
  const debt = expectedBalance - totalPayments;
  const available = (card.creditLimit ?? 0) - debt;

  const { status, trigger } = useDebouncedSave(async (value: string) => {
    const res = await fetch(`/api/cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: value }),
    });
    if (!res.ok) throw new Error("save failed");
  });

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

  function remainingFor(statement: CardStatement, payments: CardPayment[]) {
    const paid = payments
      .filter((p) => p.statementId === statement.id)
      .reduce((sum, p) => sum + p.amount, 0);
    return statement.balance - paid;
  }

  // Soonest-due statement still owing money, surfaced as a banner so it's
  // visible without expanding Sao kê — statements with no due date sort last.
  const nextDue = card.statements
    .map((s) => ({ statement: s, remaining: remainingFor(s, card.payments) }))
    .filter((x) => x.remaining > 0)
    .sort((a, b) => {
      if (!a.statement.dueDate && !b.statement.dueDate) return 0;
      if (!a.statement.dueDate) return 1;
      if (!b.statement.dueDate) return -1;
      return a.statement.dueDate.localeCompare(b.statement.dueDate);
    })[0];
  const nextDueUrgent =
    nextDue && Boolean(nextDue.statement.dueDate) && daysUntil(nextDue.statement.dueDate!) <= 3;

  const [stDate, setStDate] = useState(todayStr());
  const [stBalance, setStBalance] = useState("");
  const [stDueDate, setStDueDate] = useState("");
  const [stSubmitting, setStSubmitting] = useState(false);

  async function addStatement(e: React.FormEvent) {
    e.preventDefault();
    if (!stBalance) return;
    setStSubmitting(true);
    try {
      const res = await fetch(`/api/cards/${card.id}/statements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: stDate, balance: Number(stBalance), dueDate: stDueDate || null }),
      });
      if (res.ok) {
        const created = await res.json();
        onUpdated({ ...card, statements: [created, ...card.statements] });
        setStBalance("");
        setStDueDate("");
      }
    } finally {
      setStSubmitting(false);
    }
  }

  function handleStatementDeleted(id: string) {
    onUpdated({ ...card, statements: card.statements.filter((s) => s.id !== id) });
  }

  // Default the payment form to the most recent statement that still has a
  // balance owing, since that's normally the one being paid off.
  const defaultUnpaidStatement =
    card.statements.find((s) => remainingFor(s, card.payments) > 0) ?? card.statements[0];

  const [pDate, setPDate] = useState(todayStr());
  const [pAmount, setPAmount] = useState("");
  const [pStatementId, setPStatementId] = useState(defaultUnpaidStatement?.id ?? "");
  const [pSubmitting, setPSubmitting] = useState(false);
  const pStatementManual = useRef(false);

  // Re-sync the default selection as statements/payments change (e.g. a new
  // statement is added, or this statement gets fully paid off), unless the
  // user already picked one by hand.
  useEffect(() => {
    if (!pStatementManual.current) setPStatementId(defaultUnpaidStatement?.id ?? "");
  }, [defaultUnpaidStatement?.id]);

  async function addPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!pAmount) return;
    setPSubmitting(true);
    try {
      const res = await fetch(`/api/cards/${card.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: pDate,
          amount: Number(pAmount),
          statementId: pStatementId || null,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        onUpdated({ ...card, payments: [created, ...card.payments] });
        setPAmount("");
        pStatementManual.current = false;
      }
    } finally {
      setPSubmitting(false);
    }
  }

  async function deletePayment(id: string) {
    const res = await fetch(`/api/cards/${card.id}/payments/${id}`, { method: "DELETE" });
    if (res.ok) onUpdated({ ...card, payments: card.payments.filter((p) => p.id !== id) });
  }

  return (
    <div className="rounded-xl border border-[var(--card-border)] overflow-hidden flex flex-col shadow-sm shadow-black/[0.04] dark:shadow-black/30">
      <div className={`${theme.header} px-4 py-3 flex items-center justify-between gap-3 flex-wrap`}>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            trigger(e.target.value);
          }}
          className={`font-medium text-base bg-transparent outline-none border-b border-transparent focus:border-current px-0.5 ${theme.headerText}`}
        />
        <div className="flex items-center gap-3">
          <span className={theme.headerSubtext}>
            <SaveStatusBadge status={status} />
          </span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`text-xs underline disabled:opacity-50 ${theme.headerText}`}
          >
            Xoá thẻ
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {nextDue && (
          <div
            className={`rounded-lg px-3 py-2.5 flex items-center justify-between gap-2 flex-wrap font-medium text-white ${
              nextDueUrgent ? "bg-rose-600" : "bg-amber-500"
            }`}
          >
            <span>⚠️ Cần thanh toán {formatVnd(nextDue.remaining)}</span>
            <span className="text-sm">
              {nextDue.statement.dueDate
                ? `trước ${nextDue.statement.dueDate.slice(0, 10)}`
                : "chưa có hạn thanh toán"}
            </span>
          </div>
        )}

        {isOverdraft ? (
          <>
            <div className="rounded-md bg-black/[0.03] dark:bg-white/[0.05] px-3 py-2 flex items-center justify-between">
              <span className="text-sm text-foreground/60">Hạn mức</span>
              <span className="font-semibold">{formatVnd(card.creditLimit!)}</span>
            </div>
            <div className="rounded-md bg-black/[0.03] dark:bg-white/[0.05] px-3 py-2 flex items-center justify-between">
              <span className="text-sm text-foreground/60">Dư nợ</span>
              <span className="font-bold text-rose-600">{formatVnd(debt)}</span>
            </div>
            <div className="rounded-md bg-black/[0.03] dark:bg-white/[0.05] px-3 py-2 flex items-center justify-between">
              <span className="text-sm text-foreground/60">Khả dụng</span>
              <span className="font-semibold text-emerald-600">{formatVnd(available)}</span>
            </div>
          </>
        ) : (
          <>
            {monthTotal > 0 && (
              <div className="rounded-md bg-black/[0.03] dark:bg-white/[0.05] px-3 py-2 flex items-center justify-between">
                <span className="text-sm text-foreground/60">Chi tiêu tháng này</span>
                <span className="font-semibold text-rose-600">{formatVnd(monthTotal)}</span>
              </div>
            )}

            <div className="rounded-md bg-black/[0.03] dark:bg-white/[0.05] px-3 py-2 flex items-center justify-between">
              <span className="text-sm text-foreground/60">Dư nợ dự kiến</span>
              <span className="font-bold">{formatVnd(expectedBalance)}</span>
            </div>

            <details className="text-sm" open>
              <summary className="cursor-pointer font-medium text-foreground/80">
                Sao kê ({card.statements.length})
              </summary>
              <div className="mt-2 flex flex-col gap-2">
                {card.statements.length > 0 && (
                  <ul className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
                    {card.statements.map((s) => (
                      <StatementRow
                        key={s.id}
                        cardId={card.id}
                        statement={s}
                        remaining={remainingFor(s, card.payments)}
                        onDeleted={handleStatementDeleted}
                      />
                    ))}
                  </ul>
                )}
                <form onSubmit={addStatement} className="flex items-center gap-2 flex-wrap">
                  <label className="flex flex-col gap-0.5 text-xs text-foreground/60">
                    Kỳ sao kê
                    <input
                      type="date"
                      value={stDate}
                      onChange={(e) => setStDate(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <label className="flex flex-col gap-0.5 text-xs text-foreground/60">
                    Số tiền
                    <MoneyInput value={stBalance} onChange={setStBalance} className={`${inputClass} w-32`} />
                  </label>
                  <label className="flex flex-col gap-0.5 text-xs text-foreground/60">
                    Hạn thanh toán
                    <input
                      type="date"
                      value={stDueDate}
                      onChange={(e) => setStDueDate(e.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={stSubmitting || !stBalance}
                    className="rounded-lg bg-[var(--accent)] text-white px-3 py-1.5 text-xs font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 self-end"
                  >
                    + Thêm sao kê
                  </button>
                </form>
              </div>
            </details>
          </>
        )}

        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-foreground/80">
            Lịch sử thanh toán ({card.payments.length})
          </summary>
          <div className="mt-2 flex flex-col gap-2">
            {card.payments.length > 0 && (
              <ul className="flex flex-col divide-y divide-black/5 dark:divide-white/10">
                {card.payments.map((p) => {
                  const statement = card.statements.find((s) => s.id === p.statementId);
                  return (
                    <li
                      key={p.id}
                      className="row-hover row-hover-edge py-1 px-2 -mx-2 flex items-center justify-between gap-2 flex-wrap"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>{p.date.slice(0, 10)}</span>
                        {statement && (
                          <span className="text-xs text-foreground/50">
                            (trả sao kê {statement.date.slice(0, 10)})
                          </span>
                        )}
                      </div>
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
                  );
                })}
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
              {card.statements.length > 0 && (
                <label className="flex flex-col gap-0.5 text-xs text-foreground/60">
                  Trả cho sao kê
                  <select
                    value={pStatementId}
                    onChange={(e) => {
                      pStatementManual.current = true;
                      setPStatementId(e.target.value);
                    }}
                    className={inputClass}
                  >
                    {card.statements.map((s) => {
                      const remaining = remainingFor(s, card.payments);
                      return (
                        <option key={s.id} value={s.id}>
                          {s.date.slice(0, 10)} ·{" "}
                          {remaining > 0 ? `còn lại ${formatVnd(remaining)}` : "đã trả hết"}
                        </option>
                      );
                    })}
                  </select>
                </label>
              )}
              <button
                type="submit"
                disabled={pSubmitting || !pAmount}
                className="rounded-lg bg-[var(--accent)] text-white px-3 py-1.5 text-xs font-medium hover:bg-[var(--accent-hover)] disabled:opacity-50 self-end"
              >
                + Thêm lịch sử thanh toán
              </button>
            </form>
          </div>
        </details>
      </div>
    </div>
  );
}
