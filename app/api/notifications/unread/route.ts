import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// Number of unread updates for the signed-in user (0 when signed out), for the navbar bell.
export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ count: 0 }, { headers: { "Cache-Control": "no-store" } });

    const count = await prisma.notification.count({ where: { userId: sessionUser.id, read: false } });
    return NextResponse.json({ count }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/notifications/unread error:", error);
    return NextResponse.json({ count: 0 }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
