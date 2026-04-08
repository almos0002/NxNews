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
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVars = [
    noticiaText.variable,
    dmSans.variable,
    notoSerifDevanagari.variable,
    notoNaskhArabic.variable,
    notoSerifSC.variable,
    notoSerifTamil.variable,
  ].join(" ");

  return (
    <html lang="en" className={fontVars}>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
