import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { pool } from "@/lib/db";
import ProfileClient from "@/app/_components/ProfileClient";

export const metadata: Metadata = { title: "My Profile — KumariHub Dashboard" };

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/profile");

  const { rows } = await pool.query(
    `SELECT id, name, email, bio, image, role, "createdAt" FROM "user" WHERE id=$1`,
    [session.user.id]
  );
  const user = rows[0];
  if (!user) redirect("/en/login");

  return <ProfileClient user={user} />;
}
