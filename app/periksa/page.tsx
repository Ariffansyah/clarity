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
];

export default function Periksa() {
  return (
    <>
      <Checker aiReady={!!process.env.GROQ_API_KEY} />

      <section aria-labelledby="kalimat" className="rise-in mt-28">
        <h2 id="kalimat" className="hand text-3xl">
          kalimat favorit penipu
        </h2>
        <p className="mt-2 max-w-xl leading-relaxed text-muted">
          Kalau kamu membaca salah satu kalimat ini, berhenti sebentar dan cek dulu.
        </p>
        <div className="marquee mt-5">
          <ul className="marquee-track">
            {[...PHRASES, ...PHRASES].map((t, i) => (
              <li key={i} aria-hidden={i >= PHRASES.length || undefined}>
                <mark className="hl">{t}</mark>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
