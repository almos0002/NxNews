import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listCategories, listTags } from "@/lib/taxonomy";
import TaxonomyClient from "@/app/_components/TaxonomyClient";

export const metadata: Metadata = { title: "Categories & Tags — KumariHub Dashboard" };

export default async function TaxonomyPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/taxonomy");

  const role = (session.user as { role?: string }).role ?? "user";
  if (!["admin", "moderator"].includes(role)) redirect("/en/dashboard");

  const [categories, tags] = await Promise.all([listCategories(), listTags()]);

  return <TaxonomyClient initialCategories={categories} initialTags={tags} />;
}
