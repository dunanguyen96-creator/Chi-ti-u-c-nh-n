import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const income = await prisma.income.findMany({ orderBy: { month: "desc" } });
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

  const income = await prisma.income.upsert({
    where: { month },
    update: { amount: Math.round(Number(amount)), note: note || null },
    create: { month, amount: Math.round(Number(amount)), note: note || null },
  });

  return NextResponse.json(income, { status: 201 });
}
