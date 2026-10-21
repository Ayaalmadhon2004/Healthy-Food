"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { canManageTickets, createTicketSchema, updateTicketStatusSchema } from "@/lib/validations/support";

const TICKET_LIMIT = 5;
const TICKET_WINDOW_MS = 10 * 60 * 1000;

export type SupportActionState = { ok: boolean; error?: string } | null;

export async function createTicketAction(_prev: SupportActionState, formData: FormData): Promise<SupportActionState> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { ok: false, error: "unauthorized" };

  const limited = await rateLimit(`support:${sessionUser.id}`, { limit: TICKET_LIMIT, windowMs: TICKET_WINDOW_MS });
  if (!limited.ok) return { ok: false, error: "rate_limited" };

  const parsed = createTicketSchema.safeParse({
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { ok: false, error: "invalid" };

  try {
    await prisma.supportTicket.create({
      data: { userId: sessionUser.id, subject: parsed.data.subject, message: parsed.data.message },
    });
  } catch (error) {
    console.error("Support ticket error:", error);
    return { ok: false, error: "failed" };
  }

  revalidatePath("/support");
  return { ok: true };
}

export async function updateTicketStatusAction(formData: FormData): Promise<void> {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !canManageTickets(sessionUser.role)) return;

  const parsed = updateTicketStatusSchema.safeParse({
    ticketId: formData.get("ticketId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  try {
    await prisma.supportTicket.update({
      where: { id: parsed.data.ticketId },
      data: { status: parsed.data.status },
    });
  } catch (error) {
    console.error("Support status error:", error);
    return;
  }
  revalidatePath("/support");
}
