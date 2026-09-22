import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month");

  let where = {};
  if (month) {
    const [year, mon] = month.split("-").map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 1);
    where = { date: { gte: start, lt: end } };
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
  });
  return NextResponse.json(transactions);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { date, description, category, card, note, amount } = body;

  if (!date || !description || !category || amount === undefined) {
    return NextResponse.json(
      { error: "Thiếu thông tin bắt buộc" },
      { status: 400 },
    );
  }

  const transaction = await prisma.transaction.create({
    data: {
      date: new Date(date),
      description,
      category,
      card: card || null,
      note: note || null,
      amount: Math.round(Number(amount)),
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}
