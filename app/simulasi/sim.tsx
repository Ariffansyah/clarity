"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MAX_SIM_TURNS, PERSONAS, redact, type PersonaId, type SimLine, type SimReply, type SimReview } from "@/lib/ai";

const RESULT = {
  aman: { title: "Kamu aman", color: "var(--good)" },
  hampir: { title: "Hampir kena", color: "var(--warn)" },
  kena: { title: "Kamu kena tipu", color: "var(--danger)" },
};

async function call<T>(persona: PersonaId, mode: "balas" | "nilai", history: SimLine[]): Promise<T> {
  const res = await fetch("/api/simulasi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ persona, mode, history }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "AI sedang bermasalah. Coba lagi nanti.");
  return data as T;
}

export default function Sim({ ready }: { ready: boolean }) {
  const [persona, setPersona] = useState<PersonaId | null>(null);
  const [lines, setLines] = useState<SimLine[]>([]);
  const [busy, setBusy] = useState(false);
  const [ended, setEnded] = useState(false);
  const [review, setReview] = useState<SimReview | null>(null);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [masked, setMasked] = useState(0);
  const retry = useRef<() => void>(() => {});
  const body = useRef<HTMLDivElement>(null);
  const chat = useRef<HTMLElement>(null);
  const field = useRef<HTMLInputElement>(null);

  const p = PERSONAS.find((x) => x.id === persona);
  const turns = lines.filter((l) => l.from === "kamu").length;

  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight, behavior: "smooth" });
  }, [lines.length, busy, review]);

  async function run(action: () => Promise<void>) {
    retry.current = () => run(action);
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Koneksi gagal.");
    } finally {
      setBusy(false);
    }
  }

  function finish(id: PersonaId, history: SimLine[]) {
    setEnded(true);
    return run(async () => setReview(await call<SimReview>(id, "nilai", history)));
  }

  function start(id: PersonaId) {
    setPersona(id);
    setLines([]);
    setReview(null);
    setEnded(false);
    setMasked(0);
    setDraft("");
    requestAnimationFrame(() => chat.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    run(async () => {
      const r = await call<SimReply>(id, "balas", []);
      const first: SimLine[] = [{ from: "penipu", text: r.balasan }];
      setLines(first);
      requestAnimationFrame(() => field.current?.focus({ preventScroll: true }));
      if (r.selesai) await finish(id, first);
    });
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!persona || busy || ended) return;
    const { text, count } = redact(draft.trim());
    if (!text) return;
    const next: SimLine[] = [...lines, { from: "kamu", text }];
    setLines(next);
    setDraft("");
    setMasked(count);
    run(async () => {
      const r = await call<SimReply>(persona, "balas", next);
      const after: SimLine[] = [...next, { from: "penipu", text: r.balasan }];
      setLines(after);
      if (r.selesai || next.filter((l) => l.from === "kamu").length >= MAX_SIM_TURNS) await finish(persona, after);
    });
  }

  function block() {
    if (!persona) return;
    const next: SimLine[] = [...lines, { from: "kamu", text: "(Kamu memblokir dan melaporkan akun ini.)" }];
    setLines(next);
    finish(persona, next);
  }

  return (
    <div className="grid items-start gap-10 @min-[976px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] @min-[976px]:gap-14">
      <div className="@min-[976px]:sticky @min-[976px]:top-6">
        <h2 id="lawan" className="font-bold">
          Pilih lawan bicaramu
        </h2>
        <div className="mt-3 grid gap-2.5 @min-[592px]:grid-cols-2">
          {PERSONAS.map((x) => (
            <button
              key={x.id}
              type="button"
              disabled={!ready || busy}
              aria-pressed={persona === x.id}
              onClick={() => start(x.id)}
              className="choice aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="block">{x.name}</span>
              <span className="mt-0.5 block text-sm font-normal opacity-80">{x.situasi}</span>
            </button>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border-2 border-dashed border-line p-4 leading-relaxed">
          <p className="font-bold">Sebelum mulai</p>
          <p className="mt-1">
            Penipunya diperankan AI dari layanan Groq, jadi balasanmu dikirim ke sana. Nomor, angka panjang, dan email
            disamarkan otomatis, dan Clarity tidak menyimpan percakapannya. Tetap jangan ketik data asli, bahkan di
            simulasi.
          </p>
          {!ready && <p className="mt-2 font-semibold text-danger">Fitur AI belum aktif di server ini, jadi simulasi belum bisa dimulai.</p>}
        </div>
      </div>

      <section ref={chat} aria-labelledby="obrolan" className="scroll-mt-4">
        <div className="chat taped">
          <div className="flex items-center gap-3 border-b-2 border-line px-4 py-3">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-full border-2 border-line bg-paper text-lg font-extrabold">
              {p ? p.sender.replace(/^@/, "").charAt(0).toUpperCase() : "?"}
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="obrolan" className="truncate font-bold">
                {p ? p.sender : "Belum ada obrolan"}
              </h2>
              <p className="truncate text-sm text-muted">{p ? `${p.channel} · simulasi` : "Pilih penipu untuk mulai"}</p>
            </div>
            {p && (
              <span className="flex-none text-sm font-bold tabular-nums">
                {Math.min(turns, MAX_SIM_TURNS)}/{MAX_SIM_TURNS}
              </span>
            )}
          </div>

          <div ref={body} className="chat-body" aria-live="polite">
            {!p && (
              <div className="grid h-full place-items-center p-6 text-center">
                <p className="max-w-xs leading-relaxed text-muted">
                  Pilih salah satu penipu. Dia akan menyapamu duluan, lalu balas sesukamu seperti di chat sungguhan.
                </p>
              </div>
            )}
            {lines.map((l, i) => (
              <p key={i} className={`enter ${l.from === "kamu" ? "bubble bubble-me" : "bubble"}`}>
                {l.text}
              </p>
            ))}
            {busy && !ended && (
              <p className="bubble w-fit" aria-label="Sedang mengetik">
                <span className="typing" aria-hidden>
                  <i />
                  <i />
                  <i />
                </span>
              </p>
            )}
          </div>

          {p && !ended && (
            <div className="border-t-2 border-line p-3">
              <form onSubmit={send} className="flex gap-2">
                <label htmlFor="balasan" className="sr-only">
                  Balasanmu
                </label>
                <input
                  id="balasan"
                  ref={field}
                  className="field min-w-0 flex-1 py-2.5"
                  value={draft}
                  maxLength={300}
                  autoComplete="off"
                  disabled={busy}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ketik balasanmu…"
                />
                <button type="submit" className="btn btn-main flex-none" disabled={busy || !draft.trim()}>
                  Kirim
                </button>
              </form>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="btn text-sm" onClick={block} disabled={busy || lines.length === 0}>
                  Blokir & laporkan
                </button>
                <button type="button" className="btn btn-quiet text-sm" onClick={() => finish(p.id, lines)} disabled={busy || turns === 0}>
                  Akhiri & nilai aku
                </button>
              </div>
              {masked > 0 && (
                <p className="mt-2 text-sm font-semibold text-danger">
                  {masked} angka atau email di balasanmu disamarkan sebelum dikirim. Di dunia nyata, jangan pernah kirim data
                  seperti itu.
                </p>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 flex flex-wrap items-center gap-3" role="alert">
            <p className="font-semibold text-danger">{error}</p>
            <button type="button" className="btn" onClick={() => retry.current()}>
              Coba lagi
            </button>
          </div>
        )}

        {ended && busy && !review && (
          <p className="mt-6 font-semibold" role="status">
            Menilai obrolanmu <span className="dots" aria-hidden />
          </p>
        )}

        {review && p && (
          <div className="panel enter mt-6 p-5 @min-[592px]:p-7">
            <p className="hand text-xl">hasil simulasi</p>
            <h3 className="mt-1 text-3xl font-extrabold tracking-tight" style={{ color: RESULT[review.hasil].color }}>
              {RESULT[review.hasil].title}
            </h3>
            <p className="mt-3 text-lg leading-relaxed">{review.ringkasan}</p>
            {[
              ["Yang sudah tepat", review.bagus],
              ["Yang perlu diperbaiki", review.perbaiki],
              ["Taktik yang dipakai penipu", review.tanda],
            ].map(([title, items]) =>
              (items as string[]).length > 0 ? (
                <div key={title as string} className="mt-5">
                  <h4 className="font-bold">{title as string}</h4>
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed">
                    {(items as string[]).map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              ) : null,
            )}
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" className="btn btn-main" onClick={() => start(p.id)}>
                Ulangi dengan penipu ini
              </button>
              {review.hasil === "kena" ? (
                <Link href="/bertindak" className="btn">
                  Lihat langkah kalau terlanjur
                </Link>
              ) : (
                <a href="#lawan" className="btn">
                  Pilih penipu lain
                </a>
              )}
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted">Penilaian dibuat AI dan bisa keliru.</p>
          </div>
        )}
      </section>
    </div>
  );
}
