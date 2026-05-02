import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import DashboardSidebar from "@/app/_components/dashboard/DashboardSidebar";
import Toaster from "@/app/_components/ui/Toaster";
import styles from "./dashboard.module.css";

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

  return (
    <div className={styles.shell}>
      <DashboardSidebar
        name={user.name ?? ""}
        email={user.email}
        role={role}
      />
      <div className={styles.mainWrap}>
        {children}
      </div>
      <Toaster />
    </div>
  );
}
