import type { Metadata } from "next";
import {
  noticiaText,
  dmSans,
  notoSerifDevanagari,
  notoNaskhArabic,
  notoSerifSC,
  notoSerifTamil,
} from "./fonts";
import { LanguageProvider } from "./_i18n/LanguageContext";
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
}: Readonly<{ children: React.ReactNode }>) {
  const fontVars = [
    noticiaText.variable,
    dmSans.variable,
    notoSerifDevanagari.variable,
    notoNaskhArabic.variable,
    notoSerifSC.variable,
    notoSerifTamil.variable,
  ].join(" ");

  return (
    /* suppressHydrationWarning: the language system modifies data-lang/dir
       on the client after hydration — this suppresses the expected mismatch. */
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
