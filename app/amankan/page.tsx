import type { Metadata } from "next";
import { Checklist, KataSandi } from "./kunci";

export const metadata: Metadata = {
  title: "Amankan akun",
  description:
    "Pengaturan WhatsApp, HP, email, dan bank yang menghentikan penipuan sebelum terjadi, plus kata sandi keluarga untuk melawan suara tiruan AI.",
};

export default function Amankan() {
  return (
    <>
      <h1 className="max-w-3xl text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance sm:text-6xl">
        Kunci pintunya <mark className="hl">sebelum</mark> ada yang mengetuk.
      </h1>
      <p className="hand mt-4 text-2xl">cukup sekali, kira-kira sepuluh menit</p>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
        Banyak penipuan berhasil lewat celah yang sebenarnya bisa ditutup dari pengaturan HP. Buka aplikasinya, nyalakan
        satu per satu, lalu centang di sini. Tidak ada yang disimpan.
      </p>

      <div className="mt-10">
        <Checklist />
      </div>

      <section id="kata-sandi" aria-labelledby="judul-kata-sandi" className="mt-16 scroll-mt-6 @min-[592px]:mt-24">
        <h2 id="judul-kata-sandi" className="text-3xl font-extrabold tracking-tight @min-[592px]:text-4xl">
          Kata sandi keluarga
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">
          Penipu bisa meniru suara dan wajah orang dari video pendek di media sosial. Satu kata yang hanya keluarga tahu
          cukup untuk membongkarnya: kalau ada telepon darurat yang minta uang, tanyakan katanya.
        </p>
        <div className="mt-8">
          <KataSandi />
        </div>
      </section>
    </>
  );
}
