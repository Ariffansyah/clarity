import type { Metadata } from "next";
import { Kalam, Plus_Jakarta_Sans } from "next/font/google";
import Lembar from "./lembar";
import Tema from "./tema";
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
    // The script sets data-theme before React hydrates, so React must accept the DOM's value.
    <html lang="id" className={`${jakarta.variable} ${kalam.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Before first paint, so a saved dark theme never flashes light. Follows the system until a choice is made. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement,m=matchMedia("(prefers-color-scheme: dark)");function f(){var t;try{t=localStorage.getItem("tema")}catch(e){}d.dataset.theme=t==="dark"||t==="light"?t:m.matches?"dark":"light"}f();m.addEventListener("change",f)})()`,
          }}
        />
      </head>
      <body>
        <World />
        <Tema />
        <a href="#isi" className="skip">
          Langsung ke isi
        </a>
        <Lembar>{children}</Lembar>
      </body>
    </html>
  );
}
