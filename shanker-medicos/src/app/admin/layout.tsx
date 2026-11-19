import type { Metadata } from "next";
import "../globals.css";
import { fontVars } from "@/lib/fonts";

export const metadata: Metadata = {
  title: { default: "Admin | Shanker Medicos", template: "%s | Shanker Medicos admin" },
  robots: { index: false, follow: false },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={fontVars}>
      <body className="min-h-dvh bg-ivory">{children}</body>
    </html>
  );
}
