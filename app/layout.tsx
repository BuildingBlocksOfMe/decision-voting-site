import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Let's Decide Together | みんなで決めよう",
  description: "A website to help you make decisions with voting and discussion from others",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}

