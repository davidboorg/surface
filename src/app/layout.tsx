import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Surface — Organizational Intelligence",
  description: "The easiest way for intelligence inside an organization to surface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}
