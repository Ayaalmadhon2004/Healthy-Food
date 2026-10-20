"use server";
import type { Role } from "@prisma/client";
import { getSessionUser, isOrgRole } from "@/lib/auth";

export async function getCurrentUserRole(): Promise<Role> {
  const user = await getSessionUser();
  return user?.role ?? "USER";
}

export async function checkOrgAccess(): Promise<boolean> {
  return isOrgRole(await getCurrentUserRole());
}
