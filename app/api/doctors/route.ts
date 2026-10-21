import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerMessages } from "@/lib/i18n";

export async function GET() {
  const m = await getServerMessages();
  try {
    const doctors = await prisma.doctor.findMany({
      // Public listing: leave out the doctors' private phone and email.
      select: {
        id: true, name: true, specialty: true, about: true, qualifications: true,
        rating: true, reviews: true, location: true, image: true, availability: true,
      },
    });
    return NextResponse.json(doctors);
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: m.doctorsFailed }, { status: 500 });
  }
}