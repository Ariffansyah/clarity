import Link from "next/link";

const FILES = [
  { href: "/periksa", title: "Cek Pesan", sub: "Ragu sama pesan?" },
  { href: "/latihan", title: "Latihan", sub: "Percaya atau curiga?" },
  { href: "/simulasi", title: "Simulasi", sub: "Ngobrol dengan penipu" },
  { href: "/amankan", title: "Amankan Akun", sub: "Kunci sebelum dicoba" },
  { href: "/bertindak", title: "Sudah Terlanjur?", sub: "Langkah paling mendesak" },
];

export default function Home() {
  return (
    <>
      <h1 className="text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance sm:text-6xl">
        Mau buka <mark className="hl">berkas</mark> yang mana?
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
        Semuanya ada di meja ini. Klik salah satu untuk membukanya, atau{" "}
        {/* The home page lets clicks through to the desk; this link takes them back. */}
        <Link href="/peta" className="pointer-events-auto font-semibold text-ink underline decoration-2 underline-offset-[0.2em] hover:bg-[var(--hl-bg)]">
          baca peta tipuannya dulu
        </Link>
        .
      </p>

      <ul className="meja-links mt-8">
        {FILES.map((f) => (
          <li key={f.href}>
            {/* Yellow is kept for the visitor in a hurry. */}
            <Link href={f.href} data-anchor={f.href} className={f.href === "/bertindak" ? "choice meja-link bg-hl text-[#17181c]" : "choice meja-link"}>
              {f.title}
              <span className="block text-sm font-medium opacity-85">{f.sub}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
