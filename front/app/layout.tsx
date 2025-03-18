import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bravus",
  description: "Your scheduling and appointment management solution",
  generator: "v0.dev",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
