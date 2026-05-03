import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { pool } from "@/lib/db/db";
import UsersClient from "@/app/_components/dashboard/UsersClient";
import PaginationBar from "@/app/_components/article/PaginationBar";

export const metadata: Metadata = { title: "User Management" };

const PER_PAGE = 20;

type SearchParams = Promise<Record<string, string>>;

export default async function UsersPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/users");

  const role = (session.user as { role?: string }).role ?? "user";
  if (role !== "admin") redirect("/en/dashboard");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const offset = (page - 1) * PER_PAGE;

  const [{ rows: users }, { rows: countRows }] = await Promise.all([
    pool.query(
      `SELECT id, name, email, role, "createdAt", "banned", "banReason"
       FROM "user" ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2`,
      [PER_PAGE, offset]
    ),
    pool.query(`SELECT COUNT(*)::int AS cnt FROM "user"`),
  ]);

  const total: number = countRows[0]?.cnt ?? 0;
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <>
      <UsersClient initialUsers={users} currentUserId={session.user.id} />
      <PaginationBar page={page} totalPages={totalPages} />
    </>
  );
}
