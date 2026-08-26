import type { Metadata } from "next";

import { Header } from "@/components/header";

import "./globals.css";

export const metadata: Metadata = {
  title: { default: "EstateAI", template: "%s | EstateAI" },
  description: "Synthetic property intelligence with deterministic investment analysis.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Header />{children}</body></html>;
}
