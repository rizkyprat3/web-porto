/**
 * Contact form endpoint.
 *
 * Security layers:
 * 1. Zod re-validation (never trust the client)
 * 2. Honeypot field — silently accepted but discarded (bots think they won)
 * 3. In-memory sliding-window rate limit per IP (5 requests / 10 min)
 * 4. Control characters stripped before the message is stored/forwarded
 *
 * Storage: logs to the server by default. To persist to Supabase, set
 * SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local — the service key
 * stays server-side only and RLS keeps the table locked for anon clients.
 */
import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";

const RATE_LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;

/** ip → timestamps of recent requests (pruned on every hit). */
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

/** Remove control characters (except \n \t) that could break logs or renderers. */
function sanitize(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { message: "Too many messages — please try again later." },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  // Honeypot tripped → pretend success, store nothing.
  if (parsed.data.website !== undefined && parsed.data.website !== "") {
    return NextResponse.json({ ok: true });
  }

  const entry = {
    name: sanitize(parsed.data.name),
    email: sanitize(parsed.data.email),
    message: sanitize(parsed.data.message),
    receivedAt: new Date().toISOString(),
  };

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceKey) {
    // Insert via PostgREST with the service role (server-side only).
    const res = await fetch(`${supabaseUrl}/rest/v1/contact_messages`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(entry),
    });
    if (!res.ok) {
      console.error("Supabase insert failed:", res.status, await res.text());
      return NextResponse.json(
        { message: "Could not save your message — please email me directly." },
        { status: 502 },
      );
    }
  } else {
    // Fallback: server log only (fine for development / demo deployments)
    console.info("[contact]", entry);
  }

  return NextResponse.json({ ok: true });
}
