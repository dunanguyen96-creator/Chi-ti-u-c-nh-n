import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month");
  const baselines = await prisma.cardBaseline.findMany({
    where: month ? { month } : {},
  });
  return NextResponse.json(baselines);
}
