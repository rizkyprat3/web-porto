/**
 * Authoritative server-side contact schema (Zod).
 * Import ONLY from server code (API routes) — the client form uses the
 * lightweight `lib/contact-rules.ts` instead so Zod never ships to the
 * browser. Both are built from the same CONTACT_RULES constants, so
 * limits can't drift.
 */
import { z } from "zod";
import { CONTACT_RULES } from "@/lib/contact-rules";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(CONTACT_RULES.name.min, `Name must be at least ${CONTACT_RULES.name.min} characters`)
    .max(CONTACT_RULES.name.max, "Name is too long"),
  email: z.string().trim().email("Enter a valid email address").max(CONTACT_RULES.email.max),
  message: z
    .string()
    .trim()
    .min(CONTACT_RULES.message.min, `Message must be at least ${CONTACT_RULES.message.min} characters`)
    .max(
      CONTACT_RULES.message.max,
      `Message is too long (max ${CONTACT_RULES.message.max} characters)`,
    ),
  /** Honeypot — humans never fill this; bots do. Must stay empty. */
  website: z.literal("").optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
