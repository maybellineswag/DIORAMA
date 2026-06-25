import { NextResponse } from "next/server";
import {
  buildClassificationPrompt,
  sanitizeFolders,
  RESPONSE_SCHEMA,
} from "@/lib/taxonomy";
import type { ClassifyRequest, ClassifyResponse } from "@/lib/types";

/**
 * Server-side classification route.
 *
 * The Gemini API key lives ONLY here (process.env.GEMINI_API_KEY) and is never
 * sent to the browser. The client posts a small base64 preview; we call Gemini
 * and return strict JSON.
 */

export const runtime = "nodejs";

// Flash-Lite has the most generous free-tier limits and is well-suited to
// classification. Override with GEMINI_MODEL if you enable billing later.
const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite";
const ENDPOINT = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;

// Minimum spacing between outgoing Gemini calls. The free tier caps
// requests-per-minute, so we serialize calls with a gap. Default ~4.5s keeps
// us under Flash-Lite's free per-minute limit. Tune via env:
// lower = faster but more 429s; higher = slower but safer.
const MIN_INTERVAL_MS = Number(process.env.GEMINI_MIN_INTERVAL_MS ?? 4500);

// Module-level throttle: chains calls so they never fire closer than
// MIN_INTERVAL_MS apart, even across concurrent requests.
let throttleChain: Promise<void> = Promise.resolve();
let lastCallAt = 0;
function throttle(): Promise<void> {
  const mine = throttleChain.then(async () => {
    const wait = Math.max(0, lastCallAt + MIN_INTERVAL_MS - Date.now());
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastCallAt = Date.now();
  });
  throttleChain = mine.catch(() => {});
  return mine;
}

function fallback(error: string): ClassifyResponse {
  return { folders: [], confidence: 0, reasoning: "", error };
}

/**
 * Inspect a 429 body to tell a per-day quota exhaustion (won't recover for
 * hours) apart from a per-minute rate limit (recovers in seconds).
 */
async function parseQuota(
  res: Response,
): Promise<{ scope: "day" | "minute"; retryAfter: number }> {
  const text = await res.text().catch(() => "");
  const scope = /PerDay|per day|free_tier_requests/i.test(text)
    ? "day"
    : "minute";
  const match = text.match(/retryDelay"?:?\s*"?(\d+)s/i);
  const retryAfter = match ? Number(match[1]) : scope === "day" ? 3600 : 60;
  return { scope, retryAfter };
}

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json(
      fallback("Server is missing GEMINI_API_KEY. Add it to .env.local."),
      { status: 500 },
    );
  }

  let body: ClassifyRequest;
  try {
    body = (await req.json()) as ClassifyRequest;
  } catch {
    return NextResponse.json(fallback("Invalid request body."), { status: 400 });
  }

  if (!body.imageBase64) {
    return NextResponse.json(fallback("No image provided."), { status: 400 });
  }

  const prompt = buildClassificationPrompt(body.recentCorrections ?? []);

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: body.mimeType || "image/jpeg",
              data: body.imageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      // Classification doesn't need a reasoning budget; turn it off to save
      // tokens and latency (Flash enables thinking by default).
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  // Only 503 (model overloaded) and network errors are worth retrying — those
  // are transient. A 429 is a quota/rate-limit decision; retrying it just burns
  // time, so we fail fast and let the client decide how to pace.
  let res: Response | null = null;
  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await throttle();
    try {
      res = await fetch(ENDPOINT(key), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      res = null;
    }

    const retryable = !res || res.status === 503;
    if (!retryable) break;

    if (attempt < maxAttempts - 1) {
      const wait = 600 * 2 ** attempt + Math.random() * 250;
      await new Promise((r) => setTimeout(r, wait));
    }
  }

  if (!res) {
    return NextResponse.json(fallback("Could not reach the Gemini API."), {
      status: 502,
    });
  }

  if (res.status === 429) {
    const quota = await parseQuota(res);
    const message =
      quota.scope === "day"
        ? "Daily free limit reached for this model (Google allows ~20/day free). It resets tomorrow — or add billing to remove the cap."
        : "Hit the per-minute rate limit. Pausing briefly, then resuming.";
    return NextResponse.json(
      { ...fallback(message), quotaScope: quota.scope, retryAfterSeconds: quota.retryAfter },
      { status: 429 },
    );
  }

  if (res.status === 503) {
    return NextResponse.json(
      fallback("Gemini is overloaded right now. Wait a moment and retry."),
      { status: 503 },
    );
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return NextResponse.json(
      fallback(`Gemini error ${res.status}: ${detail.slice(0, 200)}`),
      { status: 502 },
    );
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return NextResponse.json(fallback("Gemini returned malformed JSON."), {
      status: 502,
    });
  }

  const text = extractText(data);
  const parsed = safeParse(text);
  if (!parsed) {
    return NextResponse.json(
      fallback("Could not parse the model's classification."),
      { status: 502 },
    );
  }

  const folders = sanitizeFolders(parsed.folders);
  const confidence =
    typeof parsed.confidence === "number"
      ? Math.max(0, Math.min(1, parsed.confidence))
      : 0.5;
  const reasoning =
    typeof parsed.reasoning === "string" ? parsed.reasoning : "";

  const result: ClassifyResponse = {
    folders: folders.length > 0 ? folders : ["MISC"],
    confidence: folders.length > 0 ? confidence : Math.min(confidence, 0.4),
    reasoning,
  };

  return NextResponse.json(result);
}

/** Pull the text part out of Gemini's candidate structure. */
function extractText(data: unknown): string {
  try {
    const d = data as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return d.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  } catch {
    return "";
  }
}

function safeParse(
  text: string,
): { folders?: unknown; confidence?: unknown; reasoning?: unknown } | null {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // Defensive: pull the first {...} block if the model wrapped it in prose.
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}
