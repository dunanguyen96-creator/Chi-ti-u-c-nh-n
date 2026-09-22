import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; statementId: string }> },
) {
  const { statementId } = await params;
  const body = await request.json();
  const data: Record<string, unknown> = {};

  if (body.dueDate !== undefined) {
    data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  }
  if (body.date !== undefined) data.date = new Date(body.date);
  if (body.balance !== undefined) data.balance = Math.round(Number(body.balance));

  const statement = await prisma.cardStatement.update({
    where: { id: statementId },
    data,
  });

  return NextResponse.json(statement);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; statementId: string }> },
) {
  const { statementId } = await params;
  await prisma.cardStatement.delete({ where: { id: statementId } });
  return NextResponse.json({ ok: true });
}
