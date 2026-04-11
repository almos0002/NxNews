import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardSidebar from "@/app/_components/DashboardSidebar";
import Toaster from "@/app/_components/Toaster";
import styles from "./layout.module.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard");

  const { user } = session;
  const role = (user as { role?: string }).role ?? "user";

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
