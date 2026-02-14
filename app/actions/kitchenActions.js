"use server";

import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function getIsOrg() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { role: true }
  });

  return dbUser?.role === "ORG" || dbUser?.role === "ADMIN";
}

export async function getKitchensAction() {
  try {
    const kitchens = await prisma.kitchen.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, kitchens };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateKitchenAction(kitchenId, updateData) {
  try {
    const isAuthorized = await getIsOrg();
    if (!isAuthorized) {
      return { success: false, error: "Unauthorized access" };
    }

    const updatedKitchen = await prisma.kitchen.update({
      where: { id: kitchenId },
      data: {
        todaysMeal: updateData.todaysMeal,
        distributionTime: updateData.distributionTime,
        capacity: updateData.capacity
      }
    });

    revalidatePath("/kitchens"); 
    return { success: true, kitchen: updatedKitchen };
  } catch (error) {
    return { success: false, error: error.message };
  }
}