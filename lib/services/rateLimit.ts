import { neon } from "@neondatabase/serverless";
import type { NextRequest } from "next/server";

/**
 * Fixed-window rate limits stored in Postgres, so they hold across serverless
 * instances. The AI keys are free tier (Groq: 1000 requests/day and 8000
 * tokens/minute; Gemini: 20 requests/day), so there is a cap per visitor and a
 * cap for the whole site.
 */

interface Rule {
  name: string;
  limit: number;
  windowSeconds: number;
  scope: "ip" | "global";
}

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// A deep dive uses ~6k tokens, so Groq's 8000 tokens/minute fits about one a
// minute; the minute cap stops a burst from spilling onto Gemini's 20/day
const SITE_RULES: Rule[] = [
  { name: "site-minute", limit: 4, windowSeconds: MINUTE, scope: "global" },
  { name: "site-day", limit: 800, windowSeconds: DAY, scope: "global" },
];

export const RATE_LIMITS = {
  explain: [
    { name: "explain-10min", limit: 5, windowSeconds: 10 * MINUTE, scope: "ip" },
    { name: "explain-day", limit: 25, windowSeconds: DAY, scope: "ip" },
    ...SITE_RULES,
  ],
  ask: [
    { name: "ask-10min", limit: 15, windowSeconds: 10 * MINUTE, scope: "ip" },
    { name: "ask-day", limit: 60, windowSeconds: DAY, scope: "ip" },
    ...SITE_RULES,
  ],
} satisfies Record<string, Rule[]>;

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfter: number; message: string };

let tableReady: Promise<unknown> | null = null;

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set");
  return neon(url);
}

export async function ensureRateLimitTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT NOT NULL,
      window_start TIMESTAMPTZ NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (key, window_start)
    )
  `;
}

export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "unknown";
}

// Used when the database is unreachable, so limits still apply per instance
const memoryCounts = new Map<string, { windowStart: number; count: number }>();

function incrementInMemory(key: string, windowSeconds: number) {
  const windowStart = Math.floor(Date.now() / 1000 / windowSeconds) * windowSeconds;
  const entry = memoryCounts.get(key);
  const count = entry && entry.windowStart === windowStart ? entry.count + 1 : 1;
  memoryCounts.set(key, { windowStart, count });
  if (memoryCounts.size > 5000) memoryCounts.clear();
  return { count, windowStart };
}

async function increment(key: string, windowSeconds: number) {
  try {
    const sql = getSql();
    tableReady ??= ensureRateLimitTable().catch((err) => {
      tableReady = null;
      throw err;
    });
    await tableReady;

    const rows = await sql`
      INSERT INTO rate_limits (key, window_start, count)
      VALUES (${key}, to_timestamp(floor(extract(epoch FROM now()) / ${windowSeconds}) * ${windowSeconds}), 1)
      ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limits.count + 1
      RETURNING count, extract(epoch FROM window_start)::bigint AS window_start
    `;

    // Old windows are only clutter; prune them now and then
    if (Math.random() < 0.02) {
      await sql`DELETE FROM rate_limits WHERE window_start < now() - interval '2 days'`;
    }

    return { count: Number(rows[0].count), windowStart: Number(rows[0].window_start) };
  } catch (error) {
    console.error("Rate limit store unavailable, using in-memory counts:", error);
    return incrementInMemory(key, windowSeconds);
  }
}

function describeWait(seconds: number) {
  if (seconds < 90) return "a minute";
  if (seconds < HOUR) return `${Math.ceil(seconds / MINUTE)} minutes`;
  if (seconds < 2 * HOUR) return "an hour";
  return `${Math.ceil(seconds / HOUR)} hours`;
}

/**
 * Counts this request against each rule in order and stops at the first one
 * that is over its limit, so a blocked visitor does not use up the site cap.
 */
export async function checkRateLimit(req: NextRequest, rules: Rule[]): Promise<RateLimitResult> {
  const ip = clientIp(req);

  for (const rule of rules) {
    const key = rule.scope === "ip" ? `${rule.name}:${ip}` : rule.name;
    const { count, windowStart } = await increment(key, rule.windowSeconds);
    if (count <= rule.limit) continue;

    const retryAfter = Math.max(1, windowStart + rule.windowSeconds - Math.floor(Date.now() / 1000));
    const message =
      rule.scope === "ip"
        ? `You've hit the limit for now. Please try again in ${describeWait(retryAfter)}.`
        : `The site is busy right now. Please try again in ${describeWait(retryAfter)}.`;
    return { allowed: false, retryAfter, message };
  }

  return { allowed: true };
}
