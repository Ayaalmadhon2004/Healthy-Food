"use server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server"; 

export async function getCurrentUserRole() {
    try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return "USER";
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        return "USER";
    }
    const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { role: true }
    });
    return dbUser?.role || "USER";
    } catch (error) {
    console.error("Critical Auth Error:", error);
    return "USER";
    }
}

export async function checkOrgAccess() {
    const role = await getCurrentUserRole();
    return role === "ORG" || role === "ADMIN";
}