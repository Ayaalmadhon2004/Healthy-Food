import { z } from "zod";
import type { ServerMessages } from "@/lib/i18n";

// Schemas are built per request so validation messages come out in the request's language.
export function createLoginSchema(m: ServerMessages) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, m.emailRequired)
      .email(m.emailInvalidAddress)
      .toLowerCase(),
    password: z
      .string()
      .min(1, m.passwordRequired),
  });
}

export function createSignupSchema(m: ServerMessages) {
  return z.object({
    name: z
      .string()
      .min(2, m.nameTooShort)
      .max(50, m.nameTooLong)
      .trim(),
    email: z
      .string()
      .trim()
      .min(1, m.emailRequired)
      .email(m.emailInvalidFormat)
      .toLowerCase(),
    password: z
      .string()
      .min(8, m.passwordTooShort)
      .regex(/[A-Z]/, m.passwordNeedsUpper)
      .regex(/[0-9]/, m.passwordNeedsNumber)
      .regex(/[^a-zA-Z0-9]/, m.passwordNeedsSpecial),
  });
}

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;
export type SignupInput = z.infer<ReturnType<typeof createSignupSchema>>;
