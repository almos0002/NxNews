import type { Metadata } from "next";
import Script from "next/script";
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

/* Runs synchronously before React hydration — reads the saved language
   from localStorage and applies data-lang / lang / dir on <html>
   immediately, so there is no flash of unstyled / wrong-language content. */
const antiFlashScript = `(function(){try{var l=localStorage.getItem('tdr-lang');var v=['en','ne','es','fr','ar','zh'];if(l&&v.indexOf(l)!==-1){var r=document.documentElement;r.setAttribute('data-lang',l);r.setAttribute('lang',l);if(l==='ar'){r.setAttribute('dir','rtl');}else{r.removeAttribute('dir');}}}catch(e){}})();`;

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
    /* suppressHydrationWarning: the anti-flash script changes data-lang/dir
       before React hydrates, so attributes intentionally differ from the
       server-rendered defaults. This suppresses the harmless warning. */
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <body>
        {/* beforeInteractive = runs before any JS, before React hydration */}
        <Script
          id="lang-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: antiFlashScript }}
        />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
