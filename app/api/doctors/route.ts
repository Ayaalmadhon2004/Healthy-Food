import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerMessages } from "@/lib/i18n";

export async function GET() {
  const m = await getServerMessages();
  try {
    const doctors = await prisma.doctor.findMany();
    return NextResponse.json(doctors);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: m.doctorsFailed }, { status: 500 });
  }
}