import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listArticles } from "@/lib/articles";
import ModerationClient from "@/app/_components/ModerationClient";

export const metadata: Metadata = { title: "Review Queue — KumariHub Dashboard" };

export default async function ModerationPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/moderation");

  const role = (session.user as { role?: string }).role ?? "user";
  if (!["admin", "moderator"].includes(role)) redirect("/en/dashboard");

  const articles = await listArticles({ status: "review" });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ModerationClient initialArticles={articles as any} />;
}
