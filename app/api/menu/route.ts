import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listMenuItems, createMenuItem } from "@/lib/menu";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string }).role ?? "user";
    if (!["admin", "moderator"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const menu_type = req.nextUrl.searchParams.get("type") ?? undefined;
    const items = await listMenuItems(menu_type);
    return NextResponse.json({ items });
  } catch (err) {
    console.error("[GET /api/menu]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string }).role ?? "user";
    if (!["admin", "moderator"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { menu_type, label_en, label_ne, link_type, page_id, url, sort_order, open_new_tab, section_label_en, section_label_ne } = body;

    if (!["navbar", "footer", "bottom"].includes(menu_type)) return NextResponse.json({ error: "Invalid menu_type" }, { status: 400 });
    if (!label_en?.trim()) return NextResponse.json({ error: "English label required" }, { status: 400 });
    if (link_type === "external" && !url?.trim()) return NextResponse.json({ error: "URL required for external links" }, { status: 400 });
    if (link_type === "category" && !url?.trim()) return NextResponse.json({ error: "Category slug required" }, { status: 400 });

    const item = await createMenuItem({
      menu_type, label_en: label_en.trim(), label_ne: (label_ne ?? "").trim(),
      link_type, page_id: page_id ?? null, url: url ?? "",
      sort_order: sort_order ?? 999, open_new_tab: open_new_tab ?? false,
      section_label_en: (section_label_en ?? "").trim(),
      section_label_ne: (section_label_ne ?? "").trim(),
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/menu]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
