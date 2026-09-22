import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const NUMERIC_FIELDS = [
  "monthlyInterestRate",
  "yearlyInterestRate",
  "borrowedAmount",
  "remainingAmount",
  "availableLimit",
  "interestClosingDay",
  "paymentDay",
] as const;

const TEXT_FIELDS = ["name", "serviceFee", "note", "cashbackPolicy"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const data: Record<string, unknown> = {};

  for (const field of TEXT_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field] || null;
  }
  for (const field of NUMERIC_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = body[field] === null || body[field] === "" ? null : Number(body[field]);
    }
  }

  const debt = await prisma.debtAccount.update({ where: { id }, data });
  return NextResponse.json(debt);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.debtAccount.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
