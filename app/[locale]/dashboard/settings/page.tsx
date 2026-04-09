import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllSettings } from "@/lib/settings";
import SettingsClient from "@/app/_components/SettingsClient";

export const metadata: Metadata = { title: "Settings — KumariHub Dashboard" };

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/settings");
  const role = (session.user as { role?: string }).role ?? "user";
  if (role !== "admin") redirect("/en/dashboard");

  const settings = await getAllSettings().catch(() => ({} as Record<string, string>));
  return <SettingsClient initialSettings={settings} />;
}
