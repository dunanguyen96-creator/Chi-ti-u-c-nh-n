import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const baselines = await prisma.cardPaymentBaseline.findMany();
  return NextResponse.json(baselines);
}
