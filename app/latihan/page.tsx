import type { Metadata } from "next";
import Trainer from "./trainer";

export const metadata: Metadata = {
  title: "Latihan",
  description: "Latih instingmu lewat situasi fiktif: lowongan palsu, kurir APK, teman ganti nomor, dan lainnya.",
};

export default function Latihan() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance sm:text-6xl">
        Percaya atau <mark className="hl">curiga</mark>?
      </h1>
      <p className="hand mt-4 text-2xl">semua nama, nomor, dan alamat di sini fiktif</p>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
        Sembilan situasi yang mirip kejadian sehari-hari. Pilih tindakanmu, lalu kartunya berbalik dan menunjukkan apa
        yang seharusnya kamu perhatikan.
      </p>
      <div className="mt-10">
        <Trainer />
      </div>
    </div>
  );
}
