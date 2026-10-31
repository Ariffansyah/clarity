import Link from "next/link";
import Checker from "./checker";

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

export default function Home() {
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

      <section aria-labelledby="lainnya" className="mt-24">
        <h2 id="lainnya" className="hand text-3xl">
          selain mengecek pesan…
        </h2>

        <Link href="/simulasi" className="tool tool-sim taped rise-in mt-8">
          <div>
            <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ngobrol langsung dengan <mark className="hl">penipu</mark>
            </h3>
            <p className="mt-3 max-w-md text-lg leading-relaxed text-muted">
              Penipunya diperankan AI. Dia membujuk, mendesak, dan menakut-nakuti. Kamu balas sesukamu, lalu dapat penilaian
              soal caramu menghadapinya.
            </p>
            <span className="btn btn-main mt-6">Mulai simulasi</span>
          </div>
          <div className="sim-preview" aria-hidden>
            <p className="bubble rise-in">Halo kak, ini Bank Nusantara. Ada transaksi Rp4.800.000 dari akunmu, mau dibatalkan?</p>
            <p className="bubble bubble-me rise-in">Hah? Aku nggak pernah transaksi itu.</p>
            <p className="bubble rise-in">Sebutkan kode yang barusan masuk ya kak, biar kami batalkan sekarang juga.</p>
            <p className="bubble w-fit rise-in">
              <span className="typing">
                <i />
                <i />
                <i />
              </span>
            </p>
            <span className="hand absolute -right-2 -bottom-5 rotate-[-6deg] rounded-lg bg-paper px-2 text-2xl">jangan kasih kodenya!</span>
          </div>
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <Link href="/latihan" className="tool tool-ink rise-in">
            <div>
              <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Latih instingmu</h3>
              <p className="mt-3 max-w-md text-lg leading-relaxed opacity-85">
                Sembilan situasi fiktif: lowongan palsu, kurir APK, teman ganti nomor. Pilih tindakanmu, lalu kartunya
                berbalik dan membongkar tanda-tandanya.
              </p>
              <span className="btn btn-main mt-6">Mulai latihan</span>
            </div>
            <div className="mini-flip" aria-hidden>
              <div className="mini-flip-inner">
                <div className="mini-face">
                  <span className="text-xs font-bold opacity-70">WhatsApp · nomor baru</span>
                  <span className="mt-2 block">Hai, ini aku Dina. Bisa pinjam Rp500.000 dulu? Jangan bilang siapa-siapa ya.</span>
                </div>
                <div className="mini-face mini-back">
                  <span className="text-2xl font-extrabold text-danger">Berbahaya</span>
                  <span className="mt-2 block">Telepon nomor lama Dina dulu sebelum transfer.</span>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/bertindak" className="tool tool-hl rise-in">
            <div>
              <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Sudah terlanjur?</h3>
              <p className="mt-3 max-w-md text-lg leading-relaxed text-[#3a3b40]">
                Kasih OTP, sudah transfer, atau akun dibajak. Langkahnya diurutkan dari yang paling mendesak.
              </p>
            </div>
            <ul className="mini-list" aria-hidden>
              {["Telepon bank sekarang", "Lapor ke IASC", "Simpan semua bukti"].map((t, i) => (
                <li key={t} style={{ "--i": i } as React.CSSProperties}>
                  <span className="mini-box" />
                  {t}
                </li>
              ))}
            </ul>
            <span className="btn">Lihat langkahnya</span>
          </Link>
        </div>
      </section>
    </>
  );
}
