"use client";

import { useState } from "react";
import { redact, type AIOpinion } from "@/lib/ai";
import type { Span } from "@/lib/analyze";
import Marked from "./marked";

const NAMES = ["Belum tampak ciri penipuan", "Perlu dicek lagi", "Waspada", "Sangat mencurigakan"];
const COLORS = ["var(--ink)", "var(--ink)", "var(--warn)", "var(--danger)"];

type State = { s: "idle" } | { s: "loading" } | { s: "error"; message: string } | { s: "done"; r: AIOpinion };

export default function AIOpinionCard({ text, ruleLevel, ready }: { text: string; ruleLevel: number; ready: boolean }) {
  const [state, setState] = useState<State>({ s: "idle" });
  const [copied, setCopied] = useState(false);
  const sent = redact(text);

  async function ask() {
    setState({ s: "loading" });
    try {
      const res = await fetch("/api/periksa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sent.text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "AI sedang bermasalah. Coba lagi nanti.");
      setState({ s: "done", r: data });
    } catch (e) {
      setState({ s: "error", message: e instanceof Error ? e.message : "Koneksi gagal. Coba lagi." });
    }
  }

  if (state.s === "done") {
    const r = state.r;
    const lower = sent.text.toLowerCase();
    const spans: Span[] = r.tanda
      .filter((t) => t.kutipan)
      .map((t) => {
        const start = lower.indexOf(t.kutipan.toLowerCase());
        return { start, end: start + t.kutipan.length, rule: "ai" };
      })
      .filter((s) => s.start >= 0);
    return (
      <div className="ai-card enter">
        <p className="hand text-xl">pendapat kedua dari AI</p>
        <h3 className="mt-1 text-2xl font-extrabold tracking-tight" style={{ color: COLORS[r.level] }}>
          {NAMES[r.level]}
        </h3>
        {r.modus && (
          <p className="mt-2 text-sm font-bold">
            Kemungkinan modus: <span className="rounded-md bg-[var(--hl-bg)] px-1.5 py-0.5">{r.modus}</span>
          </p>
        )}
        <p className="mt-3 leading-relaxed">{r.ringkasan}</p>
        {Math.abs(r.level - ruleLevel) >= 2 && (
          <p className="mt-3 rounded-xl border-2 border-dashed border-line p-3 leading-relaxed">
            AI dan aturan Clarity berbeda cukup jauh. Kalau ragu, perlakukan pesan ini sebagai berisiko dan pastikan lewat
            jalur resmi.
          </p>
        )}
        {spans.length > 0 && (
          <p className="mt-4 rounded-xl border-2 border-line bg-paper p-4 leading-[1.9] break-words whitespace-pre-wrap">
            <Marked text={sent.text} spans={spans} />
          </p>
        )}
        {r.tanda.length > 0 && (
          <ul className="mt-4 space-y-2.5">
            {r.tanda.map((t, i) => (
              <li key={i} className="leading-relaxed">
                {t.kutipan && <span className="font-bold">“{t.kutipan}” </span>}
                {t.alasan}
              </li>
            ))}
          </ul>
        )}
        {r.langkah.length > 0 && (
          <>
            <h4 className="mt-5 font-bold">Saran AI</h4>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 leading-relaxed marker:font-bold">
              {r.langkah.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ol>
          </>
        )}
        {r.balasan && (
          <div className="mt-5">
            <h4 className="font-bold">Kalau mau membalas</h4>
            <blockquote className="mt-2 rounded-xl border-2 border-line bg-paper p-4 leading-relaxed">{r.balasan}</blockquote>
            <button
              type="button"
              className="btn mt-3"
              onClick={() =>
                navigator.clipboard.writeText(r.balasan).then(
                  () => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  },
                  () => setCopied(false),
                )
              }
            >
              {copied ? "Tersalin" : "Salin balasan"}
            </button>
          </div>
        )}
        <p className="mt-5 text-sm leading-relaxed text-muted">Jawaban AI bisa keliru. Jadikan bahan pertimbangan, bukan keputusan akhir.</p>
      </div>
    );
  }

  return (
    <div className="ai-card">
      <p className="hand text-xl">masih ragu?</p>
      <h3 className="mt-1 text-2xl font-extrabold tracking-tight">Minta pendapat kedua dari AI</h3>
      <p className="mt-2 leading-relaxed">
        AI bisa menangkap modus yang lolos dari aturan, tapi juga bisa salah. Kalau kamu setuju, teks di bawah dikirim ke
        layanan AI Groq setelah nomor, angka panjang, dan email disamarkan. Clarity tidak menyimpannya.
      </p>
      <details className="mt-3">
        <summary className="cursor-pointer font-bold underline decoration-2 underline-offset-4">
          Lihat teks yang akan dikirim{sent.count > 0 && ` (${sent.count} bagian disamarkan)`}
        </summary>
        <p className="mt-2 max-h-48 overflow-auto rounded-xl border-2 border-line bg-paper p-3 text-sm leading-relaxed break-words whitespace-pre-wrap">
          {sent.text}
        </p>
      </details>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-main" onClick={ask} disabled={!ready || state.s === "loading"}>
          {state.s === "loading" ? (
            <>
              AI sedang membaca <span className="dots" aria-hidden />
            </>
          ) : state.s === "error" ? (
            "Coba lagi"
          ) : (
            "Kirim ke AI"
          )}
        </button>
      </div>
      <p className="mt-3 text-sm leading-relaxed" role="status">
        {!ready && <span className="text-muted">Fitur AI belum aktif di server ini.</span>}
        {state.s === "error" && <span className="font-semibold text-danger">{state.message}</span>}
      </p>
    </div>
  );
}
