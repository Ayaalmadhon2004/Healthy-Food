import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Require the shared secret (Vercel Cron sends it as a Bearer token).
  // Without CRON_SECRET the endpoint is only reachable outside production.
  const secret = process.env.CRON_SECRET;
  if (secret ? request.headers.get("authorization") !== `Bearer ${secret}` : process.env.NODE_ENV === "production") {
    return NextResponse.json({ status: "Error", message: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.user.findFirst({ select: { id: true } });

    return NextResponse.json({ 
      status: "Success", 
      message: "Database is awake!",
      timestamp: new Date().toISOString() 
    });
  } catch {
    return NextResponse.json({ status: "Error", message: "Failed to wake up DB" }, { status: 500 });
  }
}