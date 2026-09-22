import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { monthKeyFromDate } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month");

  const transactions = await prisma.transaction.findMany({
    where: month ? { recordMonth: month } : {},
    orderBy: { date: "desc" },
  });
  return NextResponse.json(transactions);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { date, description, category, card, note, amount, recordMonth } = body;

  if (!date || !description || !category || amount === undefined) {
    return NextResponse.json(
      { error: "Thiếu thông tin bắt buộc" },
      { status: 400 },
    );
  }

  const transaction = await prisma.transaction.create({
    data: {
      date: new Date(date),
      recordMonth: recordMonth || monthKeyFromDate(date),
      description,
      category,
      card: card || null,
      note: note || null,
      amount: Math.round(Number(amount)),
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}
