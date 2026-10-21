import { z } from "zod";

export const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "CLOSED"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const SUBJECT_MIN = 3;
export const SUBJECT_MAX = 120;
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2000;
const TICKET_ID_MAX = 64;

export const createTicketSchema = z.object({
  subject: z.string().trim().min(SUBJECT_MIN, "Subject is too short").max(SUBJECT_MAX, "Subject is too long"),
  message: z.string().trim().min(MESSAGE_MIN, "Message is too short").max(MESSAGE_MAX, "Message is too long"),
});

export const updateTicketStatusSchema = z.object({
  ticketId: z.string().min(1).max(TICKET_ID_MAX),
  status: z.enum(TICKET_STATUSES),
});

// Admin-only: true when the role may view and manage every ticket.
export function canManageTickets(role: string | null | undefined): boolean {
  return role === "ADMIN";
}
