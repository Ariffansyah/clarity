// Server only: holds the API key. Imported by route handlers, never by client components.

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
export const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

export class AIError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type Message = { role: "user" | "assistant"; content: string };

export async function askJSON<T>(
  system: string,
  messages: Message[],
  schema: { name: string; schema: object },
  temperature = 0.4,
): Promise<T> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new AIError(503, "Fitur AI belum diaktifkan di server ini.");

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        temperature,
        ...(MODEL.includes("gpt-oss") ? { reasoning_effort: "low" } : {}),
        messages: [{ role: "system", content: system }, ...messages],
        response_format: { type: "json_schema", json_schema: { name: schema.name, strict: true, schema: schema.schema } },
      }),
      signal: AbortSignal.timeout(25_000),
    });
  } catch {
    throw new AIError(504, "AI tidak merespons. Coba lagi sebentar lagi.");
  }

  if (res.status === 429) throw new AIError(429, "AI sedang ramai dipakai. Tunggu sebentar lalu coba lagi.");
  if (!res.ok) {
    console.error("groq", res.status, (await res.text()).slice(0, 300));
    throw new AIError(502, "Layanan AI sedang bermasalah. Coba lagi nanti.");
  }
  try {
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content) as T;
  } catch {
    throw new AIError(502, "Jawaban AI tidak bisa dibaca. Coba lagi.");
  }
}

// ponytail: per-instance memory, resets on redeploy and isn't shared between instances. Use a KV store if the key gets abused.
const hits = new Map<string, { n: number; reset: number }>();
export function rateLimited(req: Request, max = 20, windowMs = 60_000) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "lokal";
  const now = Date.now();
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  const h = hits.get(ip);
  if (!h || h.reset < now) {
    hits.set(ip, { n: 1, reset: now + windowMs });
    return false;
  }
  return ++h.n > max;
}

export function errorResponse(e: unknown) {
  if (e instanceof AIError) return Response.json({ error: e.message }, { status: e.status });
  console.error(e);
  return Response.json({ error: "Ada yang gagal. Coba lagi." }, { status: 500 });
}

export const clip = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");
