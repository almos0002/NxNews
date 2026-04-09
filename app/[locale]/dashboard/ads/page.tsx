import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllAds } from "@/lib/ads";
import AdsClient from "@/app/_components/AdsClient";
import styles from "@/app/_components/cms.module.css";

export const metadata = { title: "Ad Management — KumariHub CMS" };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export default async function AdsDashboardPage({ params }: Props) {
  const { locale } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/${locale}/login`);

  const role = (session.user as { role?: string }).role ?? "user";
  if (role !== "admin") redirect(`/${locale}/dashboard`);

  const ads = await getAllAds();

  return (
    <div className={styles.page}>
      <AdsClient initialAds={ads} />
    </div>
  );
}
