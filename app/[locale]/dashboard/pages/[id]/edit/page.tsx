import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPageById } from "@/lib/pages";
import PageEditor from "@/app/_components/PageEditor";

export const metadata: Metadata = { title: "Edit Page — KumariHub Dashboard" };

type Props = { params: Promise<{ id: string }> };

export default async function EditPagePage({ params }: Props) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/en/login?from=/en/dashboard/pages/${id}/edit`);

  const role = (session.user as { role?: string }).role ?? "user";
  if (!["admin", "moderator", "author"].includes(role)) redirect("/en/dashboard");

  const page = await getPageById(id);
  if (!page) notFound();

  return (
    <PageEditor
      initial={page}
      authorId={session.user.id}
      backHref="/en/dashboard/pages"
    />
  );
}
