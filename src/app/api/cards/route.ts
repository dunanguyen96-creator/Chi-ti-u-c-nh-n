import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CARDS } from "@/lib/constants";

export async function GET() {
  const existing = await prisma.creditCard.findMany();
  const existingNames = new Set(existing.map((c) => c.name));
  const missing = CARDS.filter((name) => !existingNames.has(name));

  if (missing.length > 0) {
    await prisma.creditCard.createMany({
      data: missing.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }

  const cards = await prisma.creditCard.findMany({
    include: {
      statements: { orderBy: { date: "desc" } },
      payments: { orderBy: { date: "desc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(cards);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.name) {
    return NextResponse.json({ error: "Thiếu tên thẻ" }, { status: 400 });
  }

  const card = await prisma.creditCard.create({
    data: { name: body.name },
    include: { statements: true, payments: true },
  });

  return NextResponse.json(card, { status: 201 });
}
