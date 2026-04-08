import {
  Noticia_Text,
  DM_Sans,
  Noto_Serif_Devanagari,
  Noto_Naskh_Arabic,
  Noto_Serif_SC,
  Noto_Serif_Tamil,
} from "next/font/google";

export const noticiaText = Noticia_Text({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-noticia",
  display: "swap",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const notoSerifDevanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "700"],
  variable: "--font-devanagari",
  display: "swap",
  preload: false,
});

export const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
});

export const notoSerifSC = Noto_Serif_SC({
  subsets: ["chinese-simplified"],
  weight: ["400", "700"],
  variable: "--font-chinese",
  display: "swap",
  preload: false,
});

export const notoSerifTamil = Noto_Serif_Tamil({
  subsets: ["tamil"],
  weight: ["400", "700"],
  variable: "--font-tamil",
  display: "swap",
  preload: false,
});
