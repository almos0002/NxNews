import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { pool } from "@/lib/db/db";
import ProfileClient from "@/app/_components/dashboard/ProfileClient";

export const metadata: Metadata = { title: "My Profile" };

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
