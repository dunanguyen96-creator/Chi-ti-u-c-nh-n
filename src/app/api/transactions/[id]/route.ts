import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const data: Record<string, unknown> = {};

  if (body.date !== undefined) data.date = new Date(body.date);
  if (body.recordMonth !== undefined) data.recordMonth = body.recordMonth;
  if (body.description !== undefined) data.description = body.description;
  if (body.category !== undefined) data.category = body.category;
  if (body.card !== undefined) data.card = body.card || null;
  if (body.note !== undefined) data.note = body.note || null;
  if (body.amount !== undefined) data.amount = Math.round(Number(body.amount));

  const transaction = await prisma.transaction.update({
    where: { id },
    data,
  });

  return NextResponse.json(transaction);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
