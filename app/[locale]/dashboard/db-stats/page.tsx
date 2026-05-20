import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import DbStatsClient from "@/app/_components/dashboard/DbStatsClient";

export const metadata: Metadata = { title: "Query Performance" };

export default async function DbStatsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/db-stats");
  const role = (session.user as { role?: string }).role ?? "user";
  if (role !== "admin") redirect("/en/dashboard");

  return <DbStatsClient />;
}
