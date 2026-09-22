import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> },
) {
  const { paymentId } = await params;
  await prisma.cardPayment.delete({ where: { id: paymentId } });
  return NextResponse.json({ ok: true });
}
