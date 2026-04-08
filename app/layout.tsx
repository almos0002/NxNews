import type { Metadata } from "next";
import { noticiaText, dmSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Daily Report — Independent Journalism",
  description:
    "The Daily Report delivers independent, in-depth journalism covering world affairs, politics, business, technology, science, and culture.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${noticiaText.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
