import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  if (!body.date || body.balance === undefined) {
    return NextResponse.json({ error: "Thiếu ngày hoặc dư nợ" }, { status: 400 });
  }

  const statement = await prisma.cardStatement.create({
    data: {
      cardId: id,
      date: new Date(body.date),
      balance: Math.round(Number(body.balance)),
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    },
  });

  return NextResponse.json(statement, { status: 201 });
}
