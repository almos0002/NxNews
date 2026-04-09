import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listMenuItems } from "@/lib/menu";
import { listPages } from "@/lib/pages";
import { categories as hardcodedCategories } from "@/app/_data/articles";
import MenuClient from "@/app/_components/MenuClient";

export const metadata: Metadata = { title: "Menu Manager — KumariHub Dashboard" };

export default async function MenuPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/menu");

  const role = (session.user as { role?: string }).role ?? "user";
  if (!["admin", "moderator"].includes(role)) redirect("/en/dashboard");

  const [allItems, pages] = await Promise.all([
    listMenuItems(),
    listPages(),
  ]);

  const navbar = allItems.filter((it) => it.menu_type === "navbar");
  const footer = allItems.filter((it) => it.menu_type === "footer");
  const bottom = allItems.filter((it) => it.menu_type === "bottom");
  const publishedPages = pages.filter((p) => p.status === "published");

  const categories = hardcodedCategories.map((c) => ({
    slug: c.toLowerCase(),
    label: c,
  }));

  return (
    <MenuClient
      initialNavbar={navbar}
      initialFooter={footer}
      initialBottom={bottom}
      pages={publishedPages.map((p) => ({ id: p.id, slug: p.slug, title_en: p.title_en }))}
      categories={categories}
    />
  );
}
