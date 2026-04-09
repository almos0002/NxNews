import { noticiaText, dmSans } from "@/app/fonts";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning className={`${noticiaText.variable} ${dmSans.variable}`}>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
