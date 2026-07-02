/**
 * Shared contact-form schema — used by BOTH the client form and the
 * API route, so validation can never drift between the two.
 */
import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long"),
  email: z.string().trim().email("Enter a valid email address").max(120),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message is too long (max 2000 characters)"),
  /** Honeypot — humans never fill this; bots do. Must stay empty. */
  website: z.literal("").optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
