import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month");
  const income = await prisma.income.findMany({
    where: month ? { month } : {},
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(income);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { month, amount, note } = body;

  if (!month || amount === undefined) {
    return NextResponse.json(
      { error: "Thiếu thông tin bắt buộc" },
      { status: 400 },
    );
  }

  const income = await prisma.income.create({
    data: { month, amount: Math.round(Number(amount)), note: note || null },
  });

  return NextResponse.json(income, { status: 201 });
}
