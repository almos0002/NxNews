import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import DbHealthClient from "@/app/_components/dashboard/DbHealthClient";

export const metadata: Metadata = { title: "Database Health" };

export default async function DbHealthPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/db-health");
  const role = (session.user as { role?: string }).role ?? "user";
  if (role !== "admin") redirect("/en/dashboard");

  return <DbHealthClient />;
}
