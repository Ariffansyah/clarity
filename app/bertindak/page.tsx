import type { Metadata } from "next";
import { Channels, Composer, Guide } from "./act";

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

      <div className="mt-10">
        <Guide />
      </div>

      <section id="peringatkan" aria-labelledby="judul-peringatkan" className="mt-24 scroll-mt-6">
        <h2 id="judul-peringatkan" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Peringatkan teman dan keluarga
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">
          Satu pesan di grup keluarga sering lebih ampuh dari poster mana pun. Pilih modusnya, sesuaikan kalimatnya, lalu
          kirim.
        </p>
        <div className="mt-8">
          <Composer />
        </div>
      </section>

      <section id="lapor" aria-labelledby="judul-lapor" className="mt-24 scroll-mt-6">
        <h2 id="judul-lapor" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Saluran resmi untuk melapor
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">
          Penipu juga membuat situs tiruan dari layanan pelaporan. Pastikan alamatnya persis seperti di bawah, dan ingat
          bahwa melapor ke saluran resmi tidak dipungut biaya.
        </p>
        <div className="mt-8">
          <Channels />
        </div>
      </section>
    </>
  );
}
