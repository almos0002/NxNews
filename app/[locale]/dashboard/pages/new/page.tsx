import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import PageEditor from "@/app/_components/editor/PageEditor";

export const metadata: Metadata = { title: "New Page" };

export default async function NewPagePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/pages/new");

  const role = (session.user as { role?: string }).role ?? "user";
  if (!["admin", "moderator", "author"].includes(role)) redirect("/en/dashboard");

  return (
    <PageEditor
      authorId={session.user.id}
      backHref="/en/dashboard/pages"
    />
  );
}
