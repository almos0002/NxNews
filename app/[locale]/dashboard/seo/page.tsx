import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getAllSettings } from "@/lib/cms/settings";
import SeoSettingsClient from "@/app/_components/dashboard/SeoSettingsClient";

export const metadata: Metadata = { title: "SEO Settings" };

export default async function SeoSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/seo");
  const role = (session.user as { role?: string }).role ?? "user";
  if (role !== "admin") redirect("/en/dashboard");

  const settings = await getAllSettings().catch(() => ({} as Record<string, string>));
  return <SeoSettingsClient initialSettings={settings} />;
}
