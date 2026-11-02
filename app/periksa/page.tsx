import type { Metadata } from "next";
import Checker from "../checker";

export const metadata: Metadata = {
  title: "Cek pesan",
  description: "Tempel chat, SMS, email, atau tautan yang bikin kamu curiga. Clarity menandai bagian yang patut dicurigai dan menjelaskan alasannya.",
};

const PHRASES = [
  "Selamat, kamu terpilih!",
  "Kirim kode OTP-nya ya",
  "Transfer dulu, besok diganti",
  "Akun Anda akan diblokir",
  "Cuma like dan follow",
  "Jangan bilang siapa-siapa",
  "Cek foto paketnya di file ini",
  "Profit 30% per minggu",
  "Cair 10 menit tanpa BI checking",
  "Ini aku, ganti nomor",
  "Maaf kak, saya salah transfer",
  "Nyalakan berbagi layar, kami bantu",
  "Scan QRIS ini untuk terima dana",
  "Ma, aku kecelakaan, tolong transfer",
];

export default function Periksa() {
  return (
    <>
      <Checker aiReady={!!process.env.GROQ_API_KEY} />

      <section aria-labelledby="kalimat" className="mt-14 @min-[592px]:mt-20">
        <h2 id="kalimat" className="hand text-3xl">
          kalimat favorit penipu
        </h2>
        <p className="mt-2 max-w-xl leading-relaxed text-muted">
          Kalau kamu membaca salah satu kalimat ini, berhenti sebentar dan cek dulu.
        </p>
        <ul className="mt-5 grid gap-x-6 gap-y-2.5 font-semibold @min-[592px]:grid-cols-2">
          {PHRASES.map((t) => (
            <li key={t}>
              <mark className="hl">{t}</mark>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
