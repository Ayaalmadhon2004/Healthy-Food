import test from "node:test";
import assert from "node:assert/strict";
import { createTicketSchema, updateTicketStatusSchema, canManageTickets } from "../lib/validations/support.ts";

test("createTicketSchema trims and accepts valid input", () => {
  const r = createTicketSchema.safeParse({ subject: "  Help me  ", message: "  I cannot log in today.  " });
  assert.equal(r.success, true);
  assert.equal(r.data.subject, "Help me");
  assert.equal(r.data.message, "I cannot log in today.");
});

test("createTicketSchema enforces length limits", () => {
  const ok = { subject: "Valid subject", message: "A valid long enough message" };
  assert.equal(createTicketSchema.safeParse({ ...ok, subject: "ab" }).success, false);
  assert.equal(createTicketSchema.safeParse({ ...ok, subject: "x".repeat(121) }).success, false);
  assert.equal(createTicketSchema.safeParse({ ...ok, message: "short" }).success, false);
  assert.equal(createTicketSchema.safeParse({ ...ok, message: "x".repeat(2001) }).success, false);
  assert.equal(createTicketSchema.safeParse({ ...ok, subject: "     " }).success, false);
  assert.equal(createTicketSchema.safeParse({ subject: null, message: null }).success, false);
});

test("updateTicketStatusSchema only allows known statuses", () => {
  for (const status of ["OPEN", "IN_PROGRESS", "CLOSED"]) {
    assert.equal(updateTicketStatusSchema.safeParse({ ticketId: "t1", status }).success, true);
  }
  assert.equal(updateTicketStatusSchema.safeParse({ ticketId: "t1", status: "DONE" }).success, false);
  assert.equal(updateTicketStatusSchema.safeParse({ ticketId: "", status: "OPEN" }).success, false);
});

test("only ADMIN can manage tickets", () => {
  assert.equal(canManageTickets("ADMIN"), true);
  for (const r of ["USER", "ORG", "DOCTOR", "", null, undefined]) assert.equal(canManageTickets(r), false);
});
