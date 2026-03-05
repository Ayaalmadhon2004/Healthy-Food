import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.user.findFirst({ select: { id: true } });

    return NextResponse.json({ 
      status: "Success", 
      message: "Database is awake!",
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    return NextResponse.json({ status: "Error", message: "Failed to wake up DB" }, { status: 500 });
  }
}