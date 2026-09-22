import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const installments = await prisma.installment.findMany({
    orderBy: { startMonth: "desc" },
  });
  return NextResponse.json(installments);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { card, totalAmount, startMonth, endMonth, monthlyAmount } = body;

  if (!card || totalAmount === undefined || !startMonth || !endMonth || monthlyAmount === undefined) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
  }

  const installment = await prisma.installment.create({
    data: {
      card,
      totalAmount: Math.round(Number(totalAmount)),
      startMonth,
      endMonth,
      monthlyAmount: Math.round(Number(monthlyAmount)),
    },
  });

  return NextResponse.json(installment, { status: 201 });
}
