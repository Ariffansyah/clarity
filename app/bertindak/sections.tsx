import { Channels, Composer, Guide } from "./act";

export default function Sections() {
  return (
    <>
      <div className="mt-10">
        <Guide />
      </div>

      <section id="peringatkan" aria-labelledby="judul-peringatkan" className="mt-16 scroll-mt-6 @min-[592px]:mt-24">
        <h2 id="judul-peringatkan" className="text-3xl font-extrabold tracking-tight @min-[592px]:text-4xl">
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

      <section id="lapor" aria-labelledby="judul-lapor" className="mt-16 scroll-mt-6 @min-[592px]:mt-24">
        <h2 id="judul-lapor" className="text-3xl font-extrabold tracking-tight @min-[592px]:text-4xl">
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
