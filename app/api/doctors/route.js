import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const doctors = await prisma.doctor.findMany();
    return NextResponse.json(doctors);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Database failed" }, { status: 500 });
  }
}