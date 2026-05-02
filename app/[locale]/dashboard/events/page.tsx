import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { listEventPhotos } from "@/lib/cms/events";
import EventsAdminClient from "@/app/_components/dashboard/EventsAdminClient";

export const metadata: Metadata = { title: "Event Photos — KumariHub Dashboard" };

export default async function EventsAdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/en/login?from=/en/dashboard/events");

  const role = (session.user as { role?: string }).role ?? "user";
  if (!["admin", "moderator"].includes(role)) redirect("/en/dashboard");

  const events = await listEventPhotos({ limit: 100, status: "all" });
  return <EventsAdminClient initialEvents={events} />;
}
