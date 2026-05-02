import { unstable_cache, revalidateTag } from "next/cache";
import { pool } from "./db";

const MENU_TAG = "menu";

export interface MenuItem {
  id: string;
  menu_type: "navbar" | "footer" | "bottom";
  label_en: string;
  label_ne: string;
  link_type: "page" | "external" | "category";
  page_id: string | null;
  url: string;
  sort_order: number;
  open_new_tab: boolean;
  section_label_en: string;
  section_label_ne: string;
  created_at: string;
  page_slug?: string;
  page_title_en?: string;
}

export interface FooterSection {
  label_en: string;
  label_ne: string;
  items: MenuItem[];
}

// Menu items are read on every page (header + footer) and change rarely.
// Cache for 5 minutes; mutations below invalidate via revalidateTag.
// IMPORTANT: include menu_type in the cache key so navbar / footer / bottom
// each get their own cache entry (otherwise the first call's result gets
// served for every subsequent menu_type).
export async function listMenuItems(menu_type?: string): Promise<MenuItem[]> {
  const key = `menu:list:${menu_type ?? "all"}`;
  return unstable_cache(
    async (): Promise<MenuItem[]> => {
      const where = menu_type ? "WHERE m.menu_type=$1" : "";
      const params = menu_type ? [menu_type] : [];
      const { rows } = await pool.query(
        `SELECT m.*, p.slug AS page_slug, p.title_en AS page_title_en
         FROM menu_items m
         LEFT JOIN pages p ON m.page_id = p.id
         ${where}
         ORDER BY m.sort_order, m.created_at`,
        params
      );
      return rows;
    },
    [key],
    { tags: [MENU_TAG], revalidate: 300 },
  )();
}

export async function getFooterSections(): Promise<FooterSection[]> {
  const items = await listMenuItems("footer");
  const sections: Map<string, FooterSection> = new Map();
  for (const item of items) {
    const key = item.section_label_en || "__unsectioned__";
    if (!sections.has(key)) {
      sections.set(key, { label_en: item.section_label_en, label_ne: item.section_label_ne, items: [] });
    }
    sections.get(key)!.items.push(item);
  }
  return Array.from(sections.values());
}

export async function getNavbarItems(): Promise<MenuItem[]> {
  return listMenuItems("navbar");
}

export async function getBottomItems(): Promise<MenuItem[]> {
  return listMenuItems("bottom");
}

export async function createMenuItem(data: Omit<MenuItem, "id" | "created_at" | "page_slug" | "page_title_en">): Promise<MenuItem> {
  const { rows } = await pool.query(
    `INSERT INTO menu_items
       (menu_type, label_en, label_ne, link_type, page_id, url, sort_order, open_new_tab, section_label_en, section_label_ne)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [data.menu_type, data.label_en, data.label_ne, data.link_type, data.page_id ?? null, data.url,
     data.sort_order, data.open_new_tab, data.section_label_en ?? "", data.section_label_ne ?? ""]
  );
  revalidateTag(MENU_TAG);
  return rows[0];
}

export async function updateMenuItem(
  id: string,
  data: Partial<Omit<MenuItem, "id" | "menu_type" | "created_at" | "page_slug" | "page_title_en">>
): Promise<MenuItem | null> {
  const { rows } = await pool.query(
    `UPDATE menu_items SET
       label_en=COALESCE($2,label_en), label_ne=COALESCE($3,label_ne),
       link_type=COALESCE($4,link_type), page_id=$5, url=COALESCE($6,url),
       sort_order=COALESCE($7,sort_order), open_new_tab=COALESCE($8,open_new_tab),
       section_label_en=COALESCE($9,section_label_en), section_label_ne=COALESCE($10,section_label_ne)
     WHERE id=$1 RETURNING *`,
    [id, data.label_en, data.label_ne, data.link_type, data.page_id ?? null, data.url,
     data.sort_order, data.open_new_tab, data.section_label_en, data.section_label_ne]
  );
  revalidateTag(MENU_TAG);
  return rows[0] ?? null;
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  const { rowCount } = await pool.query("DELETE FROM menu_items WHERE id=$1", [id]);
  revalidateTag(MENU_TAG);
  return (rowCount ?? 0) > 0;
}

export async function reorderMenuItems(items: { id: string; sort_order: number }[]): Promise<void> {
  if (!items.length) return;
  const values = items.map((_, i) => `($${i * 2 + 1}::uuid, $${i * 2 + 2}::int)`).join(",");
  const params = items.flatMap((it) => [it.id, it.sort_order]);
  await pool.query(
    `UPDATE menu_items m SET sort_order = v.sort_order
     FROM (VALUES ${values}) AS v(id, sort_order)
     WHERE m.id = v.id`,
    params
  );
  revalidateTag(MENU_TAG);
}
