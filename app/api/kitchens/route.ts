import { prisma } from "@/lib/prisma";
import { getServerMessages } from "@/lib/i18n";

export async function GET() {
  const m = await getServerMessages();
  try {
    const kitchens = await prisma.kitchen.findMany({
        orderBy: { createdAt: 'desc' }
    });
    
    return Response.json(kitchens);
  } catch {
    return Response.json({ error: m.kitchensFetchFailed }, { status: 500 });
  }
}