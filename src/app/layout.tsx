import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@fontsource/heebo/400.css";
import "@fontsource/heebo/500.css";
import "@fontsource/heebo/700.css";
import "@fontsource/heebo/800.css";
import { MotionPrefs } from "@/components/MotionPrefs";

export const metadata: Metadata = {
  title: "InvesTeen - לומדים כסף. מתרגלים השקעות.",
  description: "פלטפורמה חינוכית לבני נוער: סימולציית השקעות בכסף וירטואלי, שיעורים ומנטור חינוכי. ללא כסף אמיתי."
};

export const viewport: Viewport = { themeColor: "#0a1428" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body><MotionPrefs>{children}</MotionPrefs></body>
    </html>
  );
}
