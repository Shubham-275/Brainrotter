import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brainrotter - AI Meme Generator",
  description:
    "AI-powered meme generator. Type anything and we'll make memes from it using TinyFish web agents.",
  openGraph: {
    title: "Brainrotter - AI Meme Generator",
    description:
      "Type anything and we'll make memes from it using AI web agents.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
