import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  if (!body.date || body.amount === undefined) {
    return NextResponse.json({ error: "Thiếu ngày hoặc số tiền" }, { status: 400 });
  }

  const payment = await prisma.cardPayment.create({
    data: {
      cardId: id,
      statementId: body.statementId || null,
      date: new Date(body.date),
      amount: Math.round(Number(body.amount)),
    },
  });

  return NextResponse.json(payment, { status: 201 });
}
