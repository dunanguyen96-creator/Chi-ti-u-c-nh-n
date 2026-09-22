import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const loans = await prisma.loan.findMany({
    orderBy: { loanDate: "desc" },
  });
  return NextResponse.json(loans);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { description, loanDate, termMonths, interestRate, monthlyInterest, monthlyPrincipal } = body;

  if (
    !description ||
    !loanDate ||
    termMonths === undefined ||
    interestRate === undefined ||
    monthlyInterest === undefined ||
    monthlyPrincipal === undefined
  ) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
  }

  const loan = await prisma.loan.create({
    data: {
      description,
      loanDate: new Date(loanDate),
      termMonths: Math.round(Number(termMonths)),
      interestRate: Number(interestRate),
      monthlyInterest: Math.round(Number(monthlyInterest)),
      monthlyPrincipal: Math.round(Number(monthlyPrincipal)),
    },
  });

  return NextResponse.json(loan, { status: 201 });
}
