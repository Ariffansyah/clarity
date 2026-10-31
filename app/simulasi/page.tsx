import type { Metadata } from "next";
import Sim from "./sim";

export const metadata: Metadata = {
  title: "Simulasi",
  description: "Latihan ngobrol dengan penipu yang diperankan AI, lalu dapat penilaian atas caramu menghadapinya.",
};

export default function Simulasi() {
  return (
    <>
      <h1 className="max-w-3xl text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance sm:text-6xl">
        Ngobrol langsung dengan <mark className="hl">penipu</mark>.
      </h1>
      <p className="hand mt-4 text-2xl">tenang, penipunya diperankan AI</p>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
        Latihan kartu mengajarkan tanda-tandanya. Di sini kamu merasakan tekanannya: penipu membalas, membujuk, dan
        mendesak. Hadapi seperti biasa, lalu lihat penilaiannya.
      </p>
      <div className="mt-10">
        <Sim ready={!!process.env.GROQ_API_KEY} />
      </div>
    </>
  );
}
