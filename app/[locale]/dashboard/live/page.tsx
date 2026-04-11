import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import LiveAdminClient from "@/app/_components/LiveAdminClient";

export const metadata: Metadata = { title: "Live Streams — KumariHub Dashboard" };

async function getStreams() {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM live_streams ORDER BY display_order ASC, created_at DESC"
    );
    return rows;
  } catch {
    return [];
  }
}

export default async function LiveAdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/live");
  const role = (session.user as { role?: string }).role ?? "user";
  if (!["admin", "moderator"].includes(role)) redirect("/en/dashboard");

  const streams = await getStreams();
  return <LiveAdminClient initialStreams={streams} />;
}
