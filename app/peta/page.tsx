import type { Metadata } from "next";
import Link from "next/link";
import Peta from "./peta";

export const metadata: Metadata = {
  title: "Peta tipuan",
  description: "Modusnya ganti-ganti, bagiannya tetap: umpan, kedok, desakan, isolasi, dan permintaan. Kenali bagiannya, lalu patahkan.",
};

export default function PetaTipuan() {
  return (
    <>
      <h1 className="max-w-3xl text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance sm:text-6xl">
        Modusnya ganti-ganti. <mark className="hl">Bagiannya</mark> tetap.
      </h1>
      <p className="hand mt-4 text-2xl">peta tipuan, dari umpan sampai permintaan</p>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
        Hari ini kurir paket, besok CS bank, lusa teman yang ganti nomor. Ceritanya berganti terus, tapi hampir setiap
        tipuan dirakit dari lima bagian yang sama. Kalau kamu hafal bagiannya, modus yang belum pernah kamu dengar pun
        tetap terasa janggal.
      </p>

      <Peta />

      <p className="mt-14 max-w-2xl text-2xl leading-snug font-extrabold tracking-tight text-balance">
        Kalau kamu menemukan satu bagian saja, kamu sudah punya alasan untuk berhenti.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/periksa" className="btn btn-main">
          Cek Pesan
        </Link>
        <Link href="/latihan" className="btn">
          Latihan
        </Link>
      </div>
    </>
  );
}
