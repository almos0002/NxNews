import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { translateText, TranslateError, type TranslateLang, type TranslateFormat } from "@/lib/util/openrouter";

const ALLOWED_ROLES = new Set(["admin", "moderator", "author"]);

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role ?? "user";
    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    const b = (body ?? {}) as Record<string, unknown>;

    const text = typeof b.text === "string" ? b.text : "";
    const sourceLang = b.sourceLang;
    const targetLang = b.targetLang;
    const format = b.format ?? "plain";

    if (sourceLang !== "en" && sourceLang !== "ne") {
      return NextResponse.json({ error: "sourceLang must be 'en' or 'ne'." }, { status: 400 });
    }
    if (targetLang !== "en" && targetLang !== "ne") {
      return NextResponse.json({ error: "targetLang must be 'en' or 'ne'." }, { status: 400 });
    }
    if (format !== "plain" && format !== "html") {
      return NextResponse.json({ error: "format must be 'plain' or 'html'." }, { status: 400 });
    }
    if (!text.trim()) {
      return NextResponse.json({ error: "Nothing to translate — source field is empty." }, { status: 400 });
    }
    if (text.length > 50000) {
      return NextResponse.json({ error: "Text is too long to translate in one call." }, { status: 413 });
    }

    const translatedText = await translateText({
      text,
      sourceLang: sourceLang as TranslateLang,
      targetLang: targetLang as TranslateLang,
      format: format as TranslateFormat,
    });
    return NextResponse.json({ translatedText });
  } catch (err) {
    if (err instanceof TranslateError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[POST /api/ai/translate]", err);
    return NextResponse.json({ error: "Translation failed. Please try again." }, { status: 500 });
  }
}
