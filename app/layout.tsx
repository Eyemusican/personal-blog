import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tenzin's Blog",
  description: "Weekly learning journal by Tenzin Namgay",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
