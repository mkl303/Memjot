import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notion Clone",
  description:
    "A modern Notion clone MVP built with Next.js, Prisma and TipTap",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  );
}
