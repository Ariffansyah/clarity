"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { analyze, CONTEXT, MAX_LENGTH, type Result } from "@/lib/analyze";
import Marked from "./marked";
import Mascot from "./mascot";
import Phone from "./phone";
import AIOpinionCard from "./ai-opinion";

type State =
  | { status: "idle" }
  | { status: "loading"; text: string }
  | { status: "done"; text: string; result: Result }
  | { status: "error"; message: string };

// Fictional examples. Brands and addresses are made up.
const SAMPLES = [
  {
    channel: "SMS",
    label: "Tarif baru m-banking",
    text: "Nasabah Yth, akun m-banking Anda akan diblokir dalam 24 jam karena perubahan tarif transfer. Segera konfirmasi di nusantara-tarif-baru.top/konfirmasi",
  },
  {
    channel: "WhatsApp",
    label: "Lowongan like dan follow",
    text: "Halo kak, kami buka kerja paruh waktu dari rumah. Tugasnya cuma like dan follow akun toko, gaji Rp150.000 per tugas, tanpa pengalaman. Gabung grup Telegram kami ya, kuota terbatas hari ini.",
  },
  {
    channel: "WhatsApp",
    label: "Teman ganti nomor",
    text: "Hai, ini aku Dina. HP lamaku rusak jadi pakai nomor baru dulu. Aku lagi darurat, bisa pinjam Rp500.000 dulu? Besok aku ganti. Jangan bilang siapa-siapa ya.",
  },
  {
    channel: "WhatsApp",
    label: "Foto paket dari kurir",
    text: "Permisi kak, paket atas nama kakak tertahan di gudang karena alamat kurang lengkap. Mohon cek foto paketnya di file Foto_Paket_KirimCepat.apk ya kak.",
  },
  {
    channel: "SMS",
    label: "Kode masuk yang kamu minta sendiri",
    text: "482913 adalah kode masuk DompetKu kamu. Berlaku 5 menit. Kode ini rahasia, jangan berikan ke siapa pun, termasuk petugas DompetKu.",
  },
];

const LEVELS = [
  {
    name: "Belum ada pola yang cocok",
    note: "Aturan Clarity tidak menemukan ciri penipuan yang umum. Itu bukan jaminan aman, karena modus baru terus muncul. Kalau pesannya menyangkut uang atau akun, tetap pastikan lewat jalur resmi.",
    color: "var(--ink)",
  },
  {
    name: "Perlu dicek lagi",
    note: "Ada ciri yang sering muncul di penipuan. Belum tentu penipuan, tapi pastikan dulu sebelum menanggapi.",
    color: "var(--ink)",
  },
  {
    name: "Waspada",
    note: "Beberapa ciri penipuan muncul bersamaan. Jangan klik, bayar, atau kirim data apa pun sebelum kamu memastikannya lewat jalur resmi.",
    color: "var(--warn)",
  },
  {
    name: "Sangat mencurigakan",
    note: "Pesan ini cocok dengan banyak pola penipuan yang umum. Sebaiknya jangan ditanggapi. Blokir, lalu laporkan.",
    color: "var(--danger)",
  },
];

const SEGMENTS = ["var(--hl)", "var(--warn)", "var(--danger)"];
const STRENGTH = ["", "Tanda ringan", "Tanda sedang", "Tanda kuat"];
const STEPS = ["Membaca pola bahasa", "Memeriksa tautan", "Menyusun alasan"];

// Which "already responded" guide fits the strongest flag.
const ACT: Record<string, string> = {
  kode: "kode",
  bayar: "transfer",
  hadiah: "transfer",
  kerja: "transfer",
  untung: "transfer",
  kenalan: "transfer",
  tautan: "tautan",
  file: "apk",
  data: "data",
  pinjol: "data",
};

export default function Checker({ aiReady, compact }: { aiReady: boolean; compact?: boolean }) {
  const [text, setText] = useState("");
  const [ctx, setCtx] = useState<string[]>([]);
  const [state, setState] = useState<State>({ status: "idle" });
  const [active, setActive] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [hint, setHint] = useState("");
  const timer = useRef<number>(undefined);
  const input = useRef<HTMLTextAreaElement>(null);
  const panel = useRef<HTMLElement>(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function run(t: string, c: string[]) {
    if (!t.trim() && c.length === 0) {
      setHint("Tempel dulu isi pesannya, atau pilih minimal satu keadaan di bawah kotak teks.");
      input.current?.focus();
      return;
    }
    setHint("");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setState({ status: "loading", text: t });
    setActive(null);
    setPinned(null);
    // The panel shrinks to the loader, so bring it back into view if its top went off screen.
    requestAnimationFrame(() => {
      const el = panel.current;
      if (el && (window.innerWidth < 1024 || el.closest("dialog") || el.getBoundingClientRect().top < 0)) {
        el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    });
    clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => {
        try {
          setState({ status: "done", text: t, result: analyze(t, c) });
        } catch {
          setState({ status: "error", message: "Ada yang gagal saat memeriksa. Coba lagi, atau persingkat pesannya." });
        }
      },
      reduce ? 0 : 1300,
    );
  }

  function reset() {
    setText("");
    setCtx([]);
    setState({ status: "idle" });
    setHint("");
    input.current?.focus();
  }

  const loading = state.status === "loading";

  return (
    <div className="grid items-start gap-10 @min-[976px]:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] @min-[976px]:gap-14">
      <div className="@min-[976px]:sticky @min-[976px]:top-6">
        {!compact && <div className="flex items-end justify-between gap-4">
          <h1 className="text-[2.6rem] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance @min-[592px]:text-6xl">
            <mark className="hl">Ragu</mark> sama pesan ini?
          </h1>
          <Mascot className="w-16 shrink-0 @min-[592px]:w-24" />
        </div>}
        <p className={compact ? "max-w-xl leading-relaxed text-muted" : "mt-5 max-w-xl text-lg leading-relaxed text-muted"}>
          Tempel chat, SMS, email, atau tautan yang bikin kamu curiga. Clarity menandai bagian yang patut dicurigai dan
          menjelaskan alasannya, supaya kamu bisa memutuskan dengan kepala dingin.
        </p>

        <form
          className="mt-8 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            run(text, ctx);
          }}
        >
          <div>
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <label htmlFor="pesan" className="font-bold">
                Isi pesan atau tautan
              </label>
              <span className="text-sm text-muted tabular-nums">
                {text.length}/{MAX_LENGTH}
              </span>
            </div>
            <textarea
              id="pesan"
              ref={input}
              className="field min-h-44"
              value={text}
              maxLength={MAX_LENGTH}
              onChange={(e) => {
                setText(e.target.value);
                setHint("");
              }}
              aria-invalid={!!hint}
              aria-describedby={hint ? "pesan-hint" : undefined}
              placeholder="Tempel di sini. Nama dan nomor rekeningmu tidak perlu ikut."
            />
            {hint && (
              <p id="pesan-hint" role="alert" className="enter mt-2 font-semibold text-danger">
                {hint}
              </p>
            )}
          </div>

          <fieldset>
            <legend className="mb-3 font-bold">
              Ada yang terjadi juga? <span className="font-normal text-muted">Boleh dilewati.</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {CONTEXT.map((c) => {
                const on = ctx.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    className="chip"
                    aria-pressed={on}
                    onClick={() => {
                      setCtx(on ? ctx.filter((x) => x !== c.id) : [...ctx, c.id]);
                      setHint("");
                    }}
                  >
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {c.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn btn-main" disabled={loading}>
              {loading ? "Memeriksa…" : "Periksa pesan"}
            </button>
            {(text || ctx.length > 0) && !loading && (
              <button type="button" className="btn btn-quiet" onClick={reset}>
                Kosongkan
              </button>
            )}
          </div>

          <p className="max-w-xl text-sm leading-relaxed text-muted">
            Diperiksa langsung di browsermu memakai aturan sederhana yang bisa dijelaskan. Tidak ada yang dikirim atau
            disimpan. Hasilnya membantu kamu menimbang, bukan bukti bahwa sesuatu pasti aman atau pasti penipuan.
          </p>
        </form>
      </div>

      <section ref={panel} aria-labelledby="hasil" aria-busy={loading} className={state.status === "idle" ? "scroll-mt-4" : "panel scroll-mt-4 p-5 @min-[592px]:p-7"}>
        {state.status === "idle" && (
          <div className="enter">
            <h2 id="hasil" className="sr-only">
              Belum ada yang diperiksa
            </h2>
            {!compact && <Phone />}
            <p className="mx-auto mt-2 max-w-md text-center leading-relaxed text-muted">
              {compact ? "Belum punya pesan? Coba contoh fiktif ini." : "Begini hasilnya nanti: bagian yang mencurigakan ditandai, lalu dijelaskan satu per satu. Belum punya pesan? Coba contoh fiktif ini."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {SAMPLES.map((s, i) => (
                <button
                  key={s.label}
                  type="button"
                  className="btn sticker"
                  style={{ "--tilt": `${[-3, 2, -1.5, 3, -2][i]}deg` } as React.CSSProperties}
                  onClick={() => {
                    setText(s.text);
                    setCtx([]);
                    run(s.text, []);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {state.status === "loading" && (
          <div>
            <h2 id="hasil" className="sr-only">
              Sedang memeriksa
            </h2>
            <div className="scan" aria-hidden>
              <div className="scan-card">
                <p className="line-clamp-5 whitespace-pre-wrap">{state.text || "Memeriksa jawabanmu"}</p>
                <span className="scan-beam" />
              </div>
            </div>
            <ul className="mx-auto w-fit space-y-1.5 text-sm font-semibold" role="status">
              {STEPS.map((s, i) => (
                <li key={s} className="enter" style={{ animationDelay: `${i * 380}ms` }}>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {state.status === "error" && (
          <div className="enter" role="alert">
            <h2 id="hasil" className="text-2xl font-extrabold tracking-tight text-danger">
              Belum bisa diperiksa
            </h2>
            <p className="mt-2 leading-relaxed">{state.message}</p>
          </div>
        )}

        {state.status === "done" && (
          <Report
            text={state.text}
            result={state.result}
            active={pinned ?? active}
            pinned={pinned}
            onHover={setActive}
            onPin={(id) => setPinned(pinned === id ? null : id)}
            onReset={reset}
            aiReady={aiReady}
          />
        )}
      </section>
    </div>
  );
}

function Report({
  text,
  result,
  active,
  pinned,
  onHover,
  onPin,
  onReset,
  aiReady,
}: {
  text: string;
  result: Result;
  active: string | null;
  pinned: string | null;
  onHover: (id: string | null) => void;
  onPin: (id: string) => void;
  onReset: () => void;
  aiReady: boolean;
}) {
  const level = LEVELS[result.level];
  const tips = [...new Set(result.flags.map((f) => f.tip))].slice(0, 3);
  if (tips.length === 0) {
    tips.push(
      "Kalau pesannya menyangkut uang atau akun, pastikan lewat aplikasi atau nomor resmi yang kamu cari sendiri.",
      "Masih ragu? Tunjukkan ke teman atau keluarga sebelum menanggapi.",
    );
  }
  const guide = result.flags.map((f) => ACT[f.id]).find(Boolean);
  let i = 0;

  return (
    <div className="reveal space-y-8">
      <div style={{ "--i": i++ } as React.CSSProperties}>
        <p className="text-sm font-semibold text-muted">Hasil pemeriksaan</p>
        <h2 id="hasil" className="mt-1 text-3xl font-extrabold tracking-tight @min-[592px]:text-4xl" style={{ color: level.color }}>
          {level.name}
        </h2>
        <div className="meter mt-4 max-w-xs" role="img" aria-label={`Tingkat ${result.level} dari 3`}>
          {SEGMENTS.map((c, n) => (
            <span key={c} data-on={result.level > n} style={{ "--seg": c, "--i": n } as React.CSSProperties} />
          ))}
        </div>
        <p className="mt-4 leading-relaxed">{level.note}</p>
      </div>

      {text.trim() && (
        <div style={{ "--i": i++ } as React.CSSProperties}>
          <h3 className="font-bold">Pesanmu, sudah ditandai</h3>
          <p className="mt-3 rounded-xl border-2 border-line bg-paper p-4 leading-[1.9] break-words whitespace-pre-wrap">
            <Marked text={text} spans={result.spans} active={active} />
          </p>
        </div>
      )}

      {result.flags.length > 0 && (
        <div style={{ "--i": i++ } as React.CSSProperties}>
          <h3 className="font-bold">Kenapa patut dicurigai</h3>
          <p className="mt-1 text-sm text-muted">Pilih salah satu untuk melihat bagiannya di pesan.</p>
          <ul className="mt-4 space-y-3">
            {result.flags.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  aria-pressed={pinned === f.id}
                  onClick={() => onPin(f.id)}
                  onMouseEnter={() => onHover(f.id)}
                  onMouseLeave={() => onHover(null)}
                  onFocus={() => onHover(f.id)}
                  onBlur={() => onHover(null)}
                  className="block w-full rounded-xl border-2 border-line p-4 text-left transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--shadow)] active:translate-y-0 active:shadow-none aria-pressed:bg-[var(--hl-bg)]"
                >
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="font-bold">{f.label}</span>
                    <span className="text-sm font-semibold" style={{ color: f.weight >= 3 ? "var(--danger)" : "var(--muted)" }}>
                      {STRENGTH[f.weight]}
                    </span>
                  </span>
                  <span className="mt-1.5 block leading-relaxed">{f.why}</span>
                  <span className="mt-2 block text-sm text-muted">
                    {f.hits.length > 0 ? `Di pesanmu: ${f.hits.map((h) => `“${h}”`).join(", ")}` : "Dari jawabanmu."}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.links.length > 0 && (
        <div style={{ "--i": i++ } as React.CSSProperties}>
          <h3 className="font-bold">Tautan di pesan ini</h3>
          <ul className="mt-3 space-y-3">
            {result.links.map((l) => (
              <li key={l.url} className="rounded-xl border-2 border-line p-4">
                {/* Monospace so swapped look-alike characters (l and 1, O and 0) stay visible. */}
                <p className="font-mono text-sm break-all">{l.host}</p>
                {l.issues.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed">
                    {l.issues.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 leading-relaxed text-muted">
                    Tidak ada ciri khusus di alamat ini. Tetap lebih aman membuka situs resminya dengan mengetik sendiri.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ "--i": i++ } as React.CSSProperties}>
        <h3 className="font-bold">Yang bisa kamu lakukan sekarang</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 leading-relaxed marker:font-bold">
          {tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      </div>

      {text.trim() && (
        <div style={{ "--i": i++ } as React.CSSProperties}>
          <AIOpinionCard text={text} ruleLevel={result.level} ready={aiReady} />
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t-2 border-line pt-6" style={{ "--i": i++ } as React.CSSProperties}>
        {result.level > 0 && (
          <Link href={guide ? `/bertindak#${guide}` : "/bertindak"} className="btn">
            Sudah terlanjur menanggapi?
          </Link>
        )}
        <Link href="/bertindak#peringatkan" className="btn">
          Peringatkan teman
        </Link>
        <button type="button" className="btn btn-quiet" onClick={onReset}>
          Periksa pesan lain
        </button>
      </div>
    </div>
  );
}
