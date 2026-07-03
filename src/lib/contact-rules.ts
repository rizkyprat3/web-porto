/**
 * Client-safe contact-form rules and lightweight validation.
 * NO heavy imports here — this file ships to the browser.
 * The server API route re-validates with the Zod schema in
 * `lib/validation.ts`, which is built from these same constants.
 */

export const CONTACT_RULES = {
  name: { min: 2, max: 80 },
  email: { max: 120 },
  message: { min: 10, max: 2000 },
} as const;

/** Pragmatic email shape check (authoritative validation happens server-side). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface ContactValues {
  name: string;
  email: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

/** Lightweight client-side validation mirroring the server schema. */
export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  if (name.length < CONTACT_RULES.name.min)
    errors.name = `Name must be at least ${CONTACT_RULES.name.min} characters`;
  else if (name.length > CONTACT_RULES.name.max) errors.name = "Name is too long";

  if (!EMAIL_RE.test(email) || email.length > CONTACT_RULES.email.max)
    errors.email = "Enter a valid email address";

  if (message.length < CONTACT_RULES.message.min)
    errors.message = `Message must be at least ${CONTACT_RULES.message.min} characters`;
  else if (message.length > CONTACT_RULES.message.max)
    errors.message = `Message is too long (max ${CONTACT_RULES.message.max} characters)`;

  return errors;
}
