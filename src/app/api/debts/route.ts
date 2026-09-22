import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const debts = await prisma.debtAccount.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(debts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.name) {
    return NextResponse.json({ error: "Thiếu tên tài khoản" }, { status: 400 });
  }

  const debt = await prisma.debtAccount.create({
    data: {
      name: body.name,
      monthlyInterestRate: body.monthlyInterestRate ?? null,
      yearlyInterestRate: body.yearlyInterestRate ?? null,
      serviceFee: body.serviceFee || null,
      borrowedAmount: body.borrowedAmount ?? null,
      remainingAmount: body.remainingAmount ?? null,
      availableLimit: body.availableLimit ?? null,
      note: body.note || null,
      interestClosingDay: body.interestClosingDay ?? null,
      paymentDay: body.paymentDay ?? null,
      cashbackPolicy: body.cashbackPolicy || null,
    },
  });

  return NextResponse.json(debt, { status: 201 });
}
