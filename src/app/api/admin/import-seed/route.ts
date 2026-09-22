import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SEED_TRANSACTIONS, SEED_INCOME } from "@/lib/seedData";

// One-time import of the original Google Sheet data. Safe to call more than
// once: it checks a sentinel row from the last imported transaction and
// skips if it's already there.
export async function GET() {
  const sentinel = SEED_TRANSACTIONS[SEED_TRANSACTIONS.length - 1];
  const alreadyImported = await prisma.transaction.findFirst({
    where: {
      description: sentinel.description,
      amount: sentinel.amount,
      date: new Date(sentinel.date),
    },
  });

  if (alreadyImported) {
    return NextResponse.json({ imported: false, reason: "already imported" });
  }

  const created = await prisma.transaction.createMany({
    data: SEED_TRANSACTIONS.map((t) => ({
      date: new Date(t.date),
      description: t.description,
      category: t.category,
      card: t.card,
      note: t.note,
      amount: t.amount,
    })),
  });

  for (const income of SEED_INCOME) {
    await prisma.income.upsert({
      where: { month: income.month },
      update: { amount: income.amount },
      create: { month: income.month, amount: income.amount },
    });
  }

  return NextResponse.json({
    imported: true,
    transactions: created.count,
    incomeMonths: SEED_INCOME.length,
  });
}
