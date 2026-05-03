import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import DashboardSidebar from "@/app/_components/dashboard/DashboardSidebar";
import Toaster from "@/app/_components/ui/Toaster";
import { getSiteName } from "@/lib/cms/site-name";
import styles from "./dashboard.module.css";

// Cascades noindex to every route inside /dashboard/* — no need to repeat it
// on each individual dashboard page.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, noarchive: true },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({ children, params }: Props) {
  const { locale } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/${locale}/login?from=/${locale}/dashboard`);

  const { user } = session;
  const role = (user as { role?: string }).role ?? "user";

  if (role === "user") {
    redirect(`/${locale}/account`);
  }

  const siteName = await getSiteName(locale);

  return (
    <div className={styles.shell}>
      <DashboardSidebar
        name={user.name ?? ""}
        email={user.email}
        role={role}
        siteName={siteName}
      />
      <div className={styles.mainWrap}>
        {children}
      </div>
      <Toaster />
    </div>
  );
}
