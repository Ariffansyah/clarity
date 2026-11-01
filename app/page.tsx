import Link from "next/link";
import Mascot from "./mascot";

const FILES = [
  { href: "/periksa", title: "Cek Pesan", sub: "Ragu sama pesan?", className: "file-cek" },
  { href: "/latihan", title: "Latihan", sub: "Percaya atau curiga?", className: "file-latihan" },
  { href: "/simulasi", title: "Simulasi", sub: "Ngobrol dengan penipu", className: "file-simulasi" },
  { href: "/bertindak", title: "Sudah Terlanjur?", sub: "Langkah paling mendesak", className: "file-terlanjur" },
];

export default function Home() {
  return (
    <>
      <h1 className="text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance sm:text-6xl">
        Mau buka <mark className="hl">berkas</mark> yang mana?
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
        Klik tumpukannya atau sticky note-nya. Fiturnya langsung terbuka di hape, tanpa pindah halaman.
      </p>

      <div className="desk-stage">
        <div className="desk">
          <i className="desk-edge" />
          <i className="desk-ring desk-only" />
          <i className="desk-pen desk-only" />
          <p className="desk-note desk-hint hand" aria-hidden>
            psst, klik salah satu berkasnya ya!
          </p>
          <Mascot className="desk-sorot" />

          <ul className="files">
            {FILES.map((f, i) => (
              <li key={f.href} className={f.className}>
                <Link href={f.href} className="file">
                  {i === 0 && (
                    <span className="sheet" aria-hidden>
                      <span className="sheet-head">Cek dulu sebelum percaya</span>
                      <span className="sheet-lines">
                        <i />
                        <i />
                        <i />
                        <i />
                      </span>
                    </span>
                  )}
                  <span className="file-edge file-front" />
                  <span className="file-edge file-side" />
                  <span className="file-tab">
                    <span className="file-title">{f.title}</span>
                    <span className="file-sub">{f.sub}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="desk-note desk-urgent hand" aria-hidden>
            buru-buru? ambil yang kuning!
          </p>
        </div>
      </div>
    </>
  );
}
