import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listVideos, countVideos } from "@/lib/videos";
import VideosClient from "@/app/_components/VideosClient";
import PaginationBar from "@/app/_components/PaginationBar";

export const metadata: Metadata = { title: "Videos — KumariHub Dashboard" };

const PER_PAGE = 20;

type SearchParams = Promise<Record<string, string>>;

export default async function VideosPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/videos");

  const role = (session.user as { role?: string }).role ?? "user";
  if (!["admin", "moderator", "author"].includes(role)) redirect("/en/dashboard");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const offset = (page - 1) * PER_PAGE;

  const [videos, total] = await Promise.all([
    listVideos({ limit: PER_PAGE, offset }),
    countVideos(),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const userId = session.user.id;

  return (
    <>
      <VideosClient initialVideos={videos} authorId={userId} />
      <PaginationBar page={page} totalPages={totalPages} />
    </>
  );
}
