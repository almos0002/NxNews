import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import BackupClient from "@/app/_components/dashboard/BackupClient";

export const metadata: Metadata = { title: "Database Backups" };

export default async function BackupPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/backup");
  const role = (session.user as { role?: string }).role ?? "user";
  if (role !== "admin") redirect("/en/dashboard");

  return <BackupClient />;
}
