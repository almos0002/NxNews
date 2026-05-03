const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = "meta/llama-3.3-70b-instruct";

const CACHE_MAX = 500;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
type CacheEntry = { value: string; expires: number };
const translationCache = new Map<string, CacheEntry>();

function cacheKey(text: string, source: string, target: string, format: string): string {
  return `${source}>${target}|${format}|${text}`;
}
function cacheGet(key: string): string | null {
  const hit = translationCache.get(key);
  if (!hit) return null;
  if (hit.expires < Date.now()) {
    translationCache.delete(key);
    return null;
  }
  translationCache.delete(key);
  translationCache.set(key, hit);
  return hit.value;
}
function cacheSet(key: string, value: string): void {
  if (translationCache.size >= CACHE_MAX) {
    const oldest = translationCache.keys().next().value;
    if (oldest !== undefined) translationCache.delete(oldest);
  }
  translationCache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export type TranslateLang = "en" | "ne";
export type TranslateFormat = "plain" | "html";

export class TranslateError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

const LANG_NAME: Record<TranslateLang, string> = {
  en: "English",
  ne: "Nepali (Devanagari script)",
};

function buildPrompt(text: string, source: TranslateLang, target: TranslateLang, format: TranslateFormat): string {
  const src = LANG_NAME[source];
  const tgt = LANG_NAME[target];
  if (format === "html") {
    return [
      `You are a professional translator. Translate the following HTML content from ${src} to ${tgt}.`,
      `STRICT RULES:`,
      `- Preserve every HTML tag, attribute, and structure exactly as-is (headings, <p>, <strong>, <em>, <ul>/<ol>/<li>, <blockquote>, <a href="...">, <br>, etc.).`,
      `- Translate ONLY the visible text inside the tags. Do not translate URLs, attribute values, or HTML entities.`,
      `- Do not add, remove, or reorder any tags.`,
      `- Output ONLY the translated HTML, with no explanations, no markdown code fences, no preface.`,
      ``,
      `HTML to translate:`,
      text,
    ].join("\n");
  }
  return [
    `Translate the following text from ${src} to ${tgt}.`,
    `Output ONLY the translated text — no quotes, no explanations, no preface, no commentary.`,
    `Preserve line breaks. Keep proper nouns recognizable.`,
    ``,
    `Text:`,
    text,
  ].join("\n");
}

function stripCodeFences(s: string): string {
  let out = s.trim();
  if (out.startsWith("```")) {
    out = out.replace(/^```[a-zA-Z]*\n?/, "");
    if (out.endsWith("```")) out = out.slice(0, -3);
  }
  return out.trim();
}

function stripThinking(s: string): string {
  return s.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

export async function translateText(opts: {
  text: string;
  sourceLang: TranslateLang;
  targetLang: TranslateLang;
  format: TranslateFormat;
}): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new TranslateError(
      "Translation is not configured — the NVIDIA_API_KEY environment variable is missing.",
      503
    );
  }
  const text = opts.text;
  if (!text || !text.trim()) {
    throw new TranslateError("Nothing to translate — source field is empty.", 400);
  }
  if (opts.sourceLang === opts.targetLang) {
    throw new TranslateError("Source and target languages must differ.", 400);
  }

  const key = cacheKey(text, opts.sourceLang, opts.targetLang, opts.format);
  const cached = cacheGet(key);
  if (cached) return cached;

  const prompt = buildPrompt(text, opts.sourceLang, opts.targetLang, opts.format);

  const maxAttempts = 3;
  let lastErr: TranslateError | null = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let res: Response;
    try {
      res = await fetch(NVIDIA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          top_p: 1,
          max_tokens: 4096,
          stream: false,
        }),
      });
    } catch {
      lastErr = new TranslateError("Could not reach the translation service. Please try again.", 502);
      if (attempt < maxAttempts) { await sleep(500 * attempt); continue; }
      throw lastErr;
    }

    if (res.ok) {
      let data: { choices?: Array<{ message?: { content?: string } }> };
      try {
        data = await res.json();
      } catch {
        throw new TranslateError("Translation service returned an invalid response.", 502);
      }
      const content = data.choices?.[0]?.message?.content;
      if (!content || !content.trim()) {
        throw new TranslateError("Translation service returned an empty response.", 502);
      }
      const out = stripCodeFences(stripThinking(content));
      cacheSet(key, out);
      return out;
    }

    const body = await res.text().catch(() => "");
    if (res.status === 401 || res.status === 403) {
      throw new TranslateError("NVIDIA rejected the API key. Please update NVIDIA_API_KEY.", res.status);
    }
    if (res.status === 429) {
      lastErr = new TranslateError("Translation rate-limited by NVIDIA. Try again in a moment.", 429);
      if (attempt < maxAttempts) {
        const retryAfter = Number(res.headers.get("retry-after")) || 0;
        const waitMs = retryAfter > 0 ? retryAfter * 1000 : 1500 * attempt;
        await sleep(Math.min(waitMs, 8000));
        continue;
      }
      throw lastErr;
    }
    console.error("[nvidia] upstream error", res.status, body.slice(0, 300));
    lastErr = new TranslateError(`Translation service error (${res.status}).`, 502);
    if (attempt < maxAttempts && res.status >= 500) { await sleep(500 * attempt); continue; }
    throw lastErr;
  }
  throw lastErr ?? new TranslateError("Translation failed.", 502);
}
