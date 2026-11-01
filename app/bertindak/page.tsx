import type { Metadata } from "next";
import Sections from "./sections";

export const metadata: Metadata = {
  title: "Sudah terlanjur?",
  description: "Langkah-langkah setelah memberi OTP, transfer ke penipu, membuka tautan palsu, atau akun dibajak. Plus pesan peringatan untuk teman.",
};

export default function Bertindak() {
  return (
    <>
      <h1 className="max-w-3xl text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance sm:text-6xl">
        Sudah terlanjur? <mark className="hl">Tarik napas</mark> dulu.
      </h1>
      <p className="hand mt-4 text-2xl">kamu nggak sendirian, dan masih bisa bertindak.</p>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
        Pilih kejadian yang paling mirip. Langkahnya bisa kamu
        centang satu per satu, dan tidak ada yang disimpan.
      </p>

      <Sections />
    </>
  );
}
