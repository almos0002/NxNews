import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listVideos } from "@/lib/videos";
import VideosClient from "@/app/_components/VideosClient";

export const metadata: Metadata = { title: "Videos — KumariHub Dashboard" };

export default async function VideosPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/videos");

  const role = (session.user as { role?: string }).role ?? "user";
  if (!["admin", "moderator", "author"].includes(role)) redirect("/en/dashboard");

  const videos = await listVideos();
  const userId = session.user.id;

  return <VideosClient initialVideos={videos} authorId={userId} />;
}
