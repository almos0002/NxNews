import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import UsersClient from "@/app/_components/UsersClient";

export const metadata: Metadata = { title: "User Management — KumariHub Dashboard" };

export default async function UsersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/users");

  const role = (session.user as { role?: string }).role ?? "user";
  if (role !== "admin") redirect("/en/dashboard");

  const { rows: users } = await pool.query(
    `SELECT id, name, email, role, "createdAt", "banned", "banReason" FROM "user" ORDER BY "createdAt" DESC`
  );

  return <UsersClient initialUsers={users} currentUserId={session.user.id} />;
}
