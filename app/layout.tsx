import type { Metadata } from "next";
import { Kalam, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import Lembar from "./lembar";
import LogoMark from "./logo";
import Nav from "./nav";
import World from "./world";
import "./globals.css";

// Drawn by an Indonesian foundry for Jakarta's city identity: local voice, very readable on phones.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

// Ballpoint-style hand for red-pen notes in the margins, the way you'd mark up a printout.
const kalam = Kalam({
  variable: "--font-kalam",
  weight: "700",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Clarity · Cek dulu sebelum percaya", template: "%s · Clarity" },
  description:
    "Periksa pesan, tautan, dan tawaran yang mencurigakan, berlatih mengenali penipuan, dan tahu langkah yang harus diambil kalau sudah terlanjur.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${jakarta.variable} ${kalam.variable} antialiased`}>
      <body>
        <World />
        <a href="#isi" className="skip">
          Langsung ke isi
        </a>
        <header className="world-top mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 pt-5 sm:px-6">
          <Link href="/" className="logo flex min-h-11 items-center gap-2 text-2xl font-extrabold tracking-tight">
            <LogoMark className="h-9 w-9" />
            Clarity
          </Link>
          <Nav />
        </header>
        <Lembar>{children}</Lembar>
      </body>
    </html>
  );
}
