import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Japanese Talk",
  description: "A Next.js app for Japanese conversation practice"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
