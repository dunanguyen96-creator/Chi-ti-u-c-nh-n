"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, CARDS, monthKeyFromDate, formatMonthLabel, formatVnd, shiftMonth } from "@/lib/constants";
import { categoryTotals } from "@/lib/reportUtils";
import CategoryDonutChart from "@/components/CategoryDonutChart";
import CategoryTrendChart from "@/components/CategoryTrendChart";
import type { Transaction, Income, CategoryBaseline, CreditCard, CardPaymentBaseline } from "@/lib/types";

const TREND_MONTHS = 6;

// "Mycash thấu chi" is an overdraft account, not a real credit card — it
// has no statement/payment cycle, so it's left out of this report.
const PAYMENT_CARDS = CARDS.filter((c) => c !== "Mycash thấu chi");

export default function BaoCaoPage() {
  const [donutMonth, setDonutMonth] = useState(() => monthKeyFromDate(new Date()));
  const [tableMonth, setTableMonth] = useState(() => monthKeyFromDate(new Date()));
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [allBaselines, setAllBaselines] = useState<CategoryBaseline[]>([]);
  const [allCards, setAllCards] = useState<CreditCard[]>([]);
  const [paymentBaselines, setPaymentBaselines] = useState<CardPaymentBaseline[]>([]);
  const [incomeByMonth, setIncomeByMonth] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  const loadedIncomeMonths = useRef(new Set<string>());

  const loadIncome = useCallback(async (m: string) => {
    if (loadedIncomeMonths.current.has(m)) return;
    loadedIncomeMonths.current.add(m);
    const res = await fetch(`/api/income?month=${m}`);
    const data = (await res.json()) as Income[];
    setIncomeByMonth((prev) => {
      const next = new Map(prev);
      next.set(m, data.reduce((sum, i) => sum + i.amount, 0));
      return next;
    });
  }, []);

  // Transactions/baselines are fetched once in full: the donut and the
  // table each pick their own month, and this app's data volume is small
  // enough that filtering client-side avoids extra range-query APIs.
  useEffect(() => {
    async function loadInitial() {
      const [txRes, baselineRes, cardsRes, paymentBaselineRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/category-baselines"),
        fetch("/api/cards"),
        fetch("/api/card-payment-baselines"),
      ]);
      setAllTransactions((await txRes.json()) as Transaction[]);
      setAllBaselines((await baselineRes.json()) as CategoryBaseline[]);
      setAllCards((await cardsRes.json()) as CreditCard[]);
      setPaymentBaselines((await paymentBaselineRes.json()) as CardPaymentBaseline[]);
      await Promise.all([loadIncome(donutMonth), loadIncome(tableMonth)]);
      setLoading(false);
    }
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only, runs once
  }, []);

  useEffect(() => {
    loadIncome(donutMonth);
  }, [donutMonth, loadIncome]);

  useEffect(() => {
    loadIncome(tableMonth);
  }, [tableMonth, loadIncome]);

  const totalsByCategory = useMemo(() => {
    const monthTx = allTransactions.filter((t) => t.recordMonth === donutMonth);
    const monthBaselines = allBaselines.filter((b) => b.month === donutMonth);
    return categoryTotals(monthTx, monthBaselines);
  }, [allTransactions, allBaselines, donutMonth]);

  const tableTotalsByCategory = useMemo(() => {
    const monthTx = allTransactions.filter((t) => t.recordMonth === tableMonth);
    const monthBaselines = allBaselines.filter((b) => b.month === tableMonth);
    return categoryTotals(monthTx, monthBaselines);
  }, [allTransactions, allBaselines, tableMonth]);

  const tableTotalExpense = [...tableTotalsByCategory.values()].reduce((sum, v) => sum + v, 0);
  const tableTotalIncome = incomeByMonth.get(tableMonth) ?? 0;
  const tableBalance = tableTotalIncome - tableTotalExpense;

  const trendMonths = useMemo(() => {
    const months: string[] = [];
    for (let i = TREND_MONTHS - 1; i >= 0; i--) months.push(shiftMonth(donutMonth, -i));
    return months;
  }, [donutMonth]);

  const trendData = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const m of trendMonths) {
      const monthTx = allTransactions.filter((t) => t.recordMonth === m);
      const monthBaselines = allBaselines.filter((b) => b.month === m);
      map.set(m, categoryTotals(monthTx, monthBaselines));
    }
    return map;
  }, [trendMonths, allTransactions, allBaselines]);

  // Card payment totals = baseline (số gốc) + sum of that card's payments
  // recorded in that month, same accumulation pattern as the category and
  // card-spend baselines.
  const paymentMonths = useMemo(() => {
    const months = new Set<string>();
    for (const b of paymentBaselines) months.add(b.month);
    for (const c of allCards) for (const p of c.payments) months.add(monthKeyFromDate(p.date));
    months.add(monthKeyFromDate(new Date()));
    return [...months].sort();
  }, [paymentBaselines, allCards]);

  const paymentTotals = useMemo(() => {
    const totals = new Map<string, Map<string, number>>();
    for (const card of PAYMENT_CARDS) {
      const byMonth = new Map<string, number>();
      const cardPayments = allCards.find((c) => c.name === card)?.payments ?? [];
      for (const m of paymentMonths) {
        const baseline = paymentBaselines.find((b) => b.card === card && b.month === m)?.amount ?? 0;
        const paid = cardPayments
          .filter((p) => monthKeyFromDate(p.date) === m)
          .reduce((sum, p) => sum + p.amount, 0);
        byMonth.set(m, baseline + paid);
      }
      totals.set(card, byMonth);
    }
    return totals;
  }, [paymentMonths, paymentBaselines, allCards]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 flex flex-col gap-6 w-full">
      <h1 className="text-2xl font-semibold tracking-tight">Báo cáo</h1>

      {loading ? (
        <p className="text-sm text-foreground/50 py-6 text-center">Đang tải...</p>
      ) : (
        <>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm shadow-black/[0.04] dark:shadow-black/30">
            <h2 className="font-medium mb-3">Tỉ lệ chi theo hạng mục</h2>
            <CategoryDonutChart
              totalsByCategory={totalsByCategory}
              month={donutMonth}
              onMonthChange={setDonutMonth}
            />
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm shadow-black/[0.04] dark:shadow-black/30">
            <h2 className="font-medium mb-3">Xu hướng chi theo tháng</h2>
            <CategoryTrendChart months={trendMonths} dataByMonth={trendData} />
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-sm shadow-black/[0.04] dark:shadow-black/30 overflow-hidden">
            <div className="p-4 pb-0">
              <label className="flex items-center gap-2 text-sm self-start">
                Tháng
                <input
                  type="month"
                  value={tableMonth}
                  onChange={(e) => setTableMonth(e.target.value)}
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-2 py-1.5"
                />
                <span className="text-foreground/60">({formatMonthLabel(tableMonth)})</span>
              </label>
            </div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-foreground/60 border-b border-black/10 dark:border-white/10">
                  <th className="p-2 font-medium">Hạng mục</th>
                  <th className="p-2 font-medium text-right">Số tiền</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map((category) => (
                  <tr key={category} className="row-hover border-b border-black/5 dark:border-white/10">
                    <td className="row-hover-edge p-2">{category}</td>
                    <td className="p-2 text-right tabular-nums">
                      {tableTotalsByCategory.get(category)
                        ? formatVnd(tableTotalsByCategory.get(category)!)
                        : "–"}
                    </td>
                  </tr>
                ))}
                <tr className="font-medium border-t border-black/10 dark:border-white/10">
                  <td className="p-2">TỔNG CHI</td>
                  <td className="p-2 text-right tabular-nums text-rose-600">
                    {formatVnd(tableTotalExpense)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2">Thu nhập</td>
                  <td className="p-2 text-right tabular-nums text-emerald-600">
                    {formatVnd(tableTotalIncome)}
                  </td>
                </tr>
                <tr className="font-medium border-t border-black/10 dark:border-white/10">
                  <td className="p-2">Chênh lệch</td>
                  <td
                    className={`p-2 text-right tabular-nums ${
                      tableBalance >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {formatVnd(tableBalance)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm shadow-black/[0.04] dark:shadow-black/30 overflow-x-auto">
            <h2 className="font-medium mb-3">Thanh toán thẻ theo tháng</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-foreground/60 border-b border-black/10 dark:border-white/10">
                  <th className="p-2 font-medium">Thẻ</th>
                  {paymentMonths.map((m) => (
                    <th key={m} className="p-2 font-medium text-right whitespace-nowrap">
                      {formatMonthLabel(m)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PAYMENT_CARDS.map((card) => (
                  <tr key={card} className="row-hover border-b border-black/5 dark:border-white/10">
                    <td className="row-hover-edge p-2 whitespace-nowrap">{card}</td>
                    {paymentMonths.map((m) => {
                      const amount = paymentTotals.get(card)?.get(m) ?? 0;
                      return (
                        <td key={m} className="p-2 text-right tabular-nums whitespace-nowrap">
                          {amount ? formatVnd(amount) : "–"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="font-medium border-t border-black/10 dark:border-white/10">
                  <td className="p-2">TỔNG</td>
                  {paymentMonths.map((m) => {
                    const total = PAYMENT_CARDS.reduce(
                      (sum, card) => sum + (paymentTotals.get(card)?.get(m) ?? 0),
                      0,
                    );
                    return (
                      <td key={m} className="p-2 text-right tabular-nums whitespace-nowrap">
                        {formatVnd(total)}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
