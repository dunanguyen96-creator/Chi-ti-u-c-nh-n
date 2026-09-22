import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; statementId: string }> },
) {
  const { statementId } = await params;
  await prisma.cardStatement.delete({ where: { id: statementId } });
  return NextResponse.json({ ok: true });
}
