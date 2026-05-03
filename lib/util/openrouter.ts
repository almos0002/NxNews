const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "qwen/qwen3-next-80b-a3b-instruct:free";

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

export async function translateText(opts: {
  text: string;
  sourceLang: TranslateLang;
  targetLang: TranslateLang;
  format: TranslateFormat;
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new TranslateError(
      "Translation is not configured — the OPENROUTER_API_KEY environment variable is missing.",
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

  const prompt = buildPrompt(text, opts.sourceLang, opts.targetLang, opts.format);

  let res: Response;
  try {
    res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      }),
    });
  } catch {
    throw new TranslateError("Could not reach the translation service. Please try again.", 502);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 401 || res.status === 403) {
      throw new TranslateError("OpenRouter rejected the API key. Please update OPENROUTER_API_KEY.", res.status);
    }
    if (res.status === 429) {
      throw new TranslateError("Translation rate-limited by OpenRouter. Try again in a moment.", 429);
    }
    console.error("[openrouter] upstream error", res.status, body.slice(0, 300));
    throw new TranslateError(`Translation service error (${res.status}).`, 502);
  }

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
  return stripCodeFences(content);
}
