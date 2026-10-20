import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Returns { id, role } for the signed-in user (taken from the session cookie), or null.
export interface SessionUser {
  id: string;
  role: Role;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return null;

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, role: true },
    });

    return dbUser ?? null;
  } catch (error) {
    console.error("Session lookup failed:", error);
    return null;
  }
}

export function isOrgRole(role: string | null | undefined): boolean {
  return role === "ORG" || role === "ADMIN";
}
