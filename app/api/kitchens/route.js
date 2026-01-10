// app/api/kitchens/route.js
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const kitchens = await prisma.kitchen.findMany({
        orderBy: { createdAt: 'desc' }
    });
    
    return Response.json(kitchens);
  } catch (error) {
    return Response.json({ error: "Failed to fetch kitchens" }, { status: 500 });
  }
}