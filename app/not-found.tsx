import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tidak ditemukan",
};

// Any address the desk has no thing for. On the desk it lies on the printout.
export default function NotFound() {
  return (
    <>
      <h1 className="max-w-3xl text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance sm:text-6xl">
        Berkas ini <mark className="hl">tidak ada</mark> di meja.
      </h1>
      <p className="hand mt-4 text-2xl">mungkin alamatnya salah ketik</p>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
        Alamat yang kamu buka tidak cocok dengan berkas mana pun. Kembali ke meja dan pilih dari sana, atau langsung cek
        pesan yang bikin kamu ragu.
      </p>
      <div className="mt-8 grid gap-3 @min-[592px]:flex">
        <Link href="/" className="btn btn-main">
          Kembali ke meja
        </Link>
        <Link href="/periksa" className="btn">
          Cek Pesan
        </Link>
      </div>
    </>
  );
}
