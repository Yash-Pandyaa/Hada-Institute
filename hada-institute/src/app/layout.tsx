import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/providers";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} Notes Marketplace`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className="h-full antialiased" lang="en">
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
