import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const data: Record<string, unknown> = {};

  if (body.name !== undefined) data.name = body.name;
  if (body.installmentTerm !== undefined) data.installmentTerm = body.installmentTerm || null;
  if (body.cardLimit !== undefined) {
    data.cardLimit = body.cardLimit === null || body.cardLimit === "" ? null : Number(body.cardLimit);
  }
  if (body.installmentAmount !== undefined) {
    data.installmentAmount =
      body.installmentAmount === null || body.installmentAmount === "" ? null : Number(body.installmentAmount);
  }

  const card = await prisma.creditCard.update({
    where: { id },
    data,
    include: { statements: true, payments: true },
  });

  return NextResponse.json(card);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.creditCard.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
