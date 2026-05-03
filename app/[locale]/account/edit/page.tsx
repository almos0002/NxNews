import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { pool } from "@/lib/db/db";
import Header from "@/app/_components/layout/Header";
import Footer from "@/app/_components/layout/Footer";
import Toaster from "@/app/_components/ui/Toaster";
import ProfileClient from "@/app/_components/dashboard/ProfileClient";
import { getLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Edit Profile",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AccountEditPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const locale = await getLocale();
  if (!session) redirect(`/${locale}/login?from=/${locale}/account/edit`);

  const { rows } = await pool.query(
    `SELECT id, name, email, bio, image, role, "createdAt" FROM "user" WHERE id=$1`,
    [session.user.id]
  );
  const user = rows[0];
  if (!user) redirect(`/${locale}/login`);

  return (
    <>
      <Header />
      <main style={{ minHeight: "60vh", background: "var(--color-bg, #f8f7f2)", padding: "40px 0 80px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ marginBottom: 24 }}>
            <a
              href={`/${locale}/account`}
              style={{ fontFamily: "var(--font-serif)", fontSize: "0.82rem", color: "var(--color-ink-muted)", textDecoration: "none" }}
            >
              ← Back to Account
            </a>
          </div>
          <ProfileClient user={user} />
        </div>
      </main>
      <Footer />
      <Toaster />
    </>
  );
}
