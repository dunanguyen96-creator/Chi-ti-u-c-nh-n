"use client";

import { useEffect, useState } from "react";
import { formatVnd, formatDateDMY } from "@/lib/constants";
import type { CreditCard, Loan } from "@/lib/types";

interface UpcomingItem {
  key: string;
  kind: "card" | "loan";
  label: string;
  amount: number;
  dueDate: Date;
}

function remainingFor(statement: CreditCard["statements"][number], payments: CreditCard["payments"]) {
  const paid = payments
    .filter((p) => p.statementId === statement.id)
    .reduce((sum, p) => sum + p.amount, 0);
  return statement.balance - paid;
}

// Next occurrence of `day` (1-28) on/after today.
function nextPaymentDate(day: number, from: Date): Date {
  const candidate = new Date(from.getFullYear(), from.getMonth(), day);
  candidate.setHours(0, 0, 0, 0);
  if (candidate < from) candidate.setMonth(candidate.getMonth() + 1);
  return candidate;
}

function loanEndDate(loan: Loan): Date {
  const start = new Date(loan.loanDate);
  return new Date(start.getFullYear(), start.getMonth() + loan.termMonths, start.getDate());
}

function daysUntil(date: Date, from: Date): number {
  return Math.round((date.getTime() - from.getTime()) / 86_400_000);
}

export default function UpcomingPaymentsModal() {
  const [items, setItems] = useState<UpcomingItem[] | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const [cardsRes, loansRes] = await Promise.all([fetch("/api/cards"), fetch("/api/loans")]);
      const cards = (await cardsRes.json()) as CreditCard[];
      const loans = (await loansRes.json()) as Loan[];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const list: UpcomingItem[] = [];

      for (const card of cards) {
        for (const statement of card.statements) {
          if (!statement.dueDate) continue;
          const remaining = remainingFor(statement, card.payments);
          if (remaining <= 0) continue;
          list.push({
            key: `card-${statement.id}`,
            kind: "card",
            label: card.name,
            amount: remaining,
            dueDate: new Date(statement.dueDate),
          });
        }
      }

      for (const loan of loans) {
        if (!loan.paymentDay) continue;
        if (today > loanEndDate(loan)) continue;
        list.push({
          key: `loan-${loan.id}`,
          kind: "loan",
          label: loan.description,
          amount: loan.monthlyPayment,
          dueDate: nextPaymentDate(loan.paymentDay, today),
        });
      }

      list.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
      setItems(list);
      if (list.length > 0) setOpen(true);
    }
    load();
  }, []);

  if (!open || !items || items.length === 0) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md rounded-xl bg-[var(--card)] border border-[var(--card-border)] shadow-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--card-border)]">
          <h2 className="font-medium">Lịch thanh toán sắp tới</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-foreground/50 hover:text-foreground/80 text-lg leading-none px-1"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>
        <ul className="overflow-y-auto p-2 flex flex-col gap-1">
          {items.map((item) => {
            const days = daysUntil(item.dueDate, today);
            const urgent = days <= 3;
            return (
              <li
                key={item.key}
                className={`row-hover row-hover-edge flex items-center justify-between gap-3 rounded-md px-2.5 py-2 ${
                  urgent ? "bg-rose-50 dark:bg-rose-950/40" : ""
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span className="flex items-center gap-1.5 text-sm truncate">
                    <span aria-hidden>{item.kind === "card" ? "💳" : "🏦"}</span>
                    {item.label}
                  </span>
                  <span className={`text-xs ${urgent ? "text-rose-600 font-medium" : "text-foreground/50"}`}>
                    {days < 0
                      ? `Quá hạn ${-days} ngày`
                      : days === 0
                        ? "Hạn hôm nay"
                        : `Còn ${days} ngày · ${formatDateDMY(item.dueDate.toISOString())}`}
                  </span>
                </div>
                <span className="tabular-nums font-medium shrink-0">{formatVnd(item.amount)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
