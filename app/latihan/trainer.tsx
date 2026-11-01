"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { analyze } from "@/lib/analyze";
import { SCENARIOS, type Grade, type Scenario } from "@/lib/scenarios";
import Marked from "../marked";

const VERDICT: Record<Grade, { title: string; color: string }> = {
  tepat: { title: "Tepat", color: "var(--good)" },
  kurang: { title: "Kurang tepat", color: "var(--warn)" },
  bahaya: { title: "Berbahaya", color: "var(--danger)" },
};

export default function Trainer() {
  const [order, setOrder] = useState(() => SCENARIOS.map((_, i) => i));
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  // What the back of the card shows. Kept separate so it doesn't go blank while flipping back.
  const [reveal, setReveal] = useState<{ s: Scenario; p: number } | null>(null);
  const front = useRef<HTMLHeadingElement>(null);
  const back = useRef<HTMLHeadingElement>(null);

  const total = order.length;
  const scenario = SCENARIOS[order[Math.min(step, total - 1)]];
  const flipped = picks[step] !== undefined;

  // The card's two sides differ in length: start reading the new one at its top, wherever the old one was scrolled to.
  function show(heading: React.RefObject<HTMLHeadingElement | null>) {
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
  }

  function choose(p: number) {
    setPicks([...picks.slice(0, step), p]);
    setReveal({ s: scenario, p });
    show(back);
  }

  function next() {
    setStep(step + 1);
    show(front);
  }

  function restart() {
    const o = SCENARIOS.map((_, i) => i);
    for (let i = o.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [o[i], o[j]] = [o[j], o[i]];
    }
    setOrder(o);
    setPicks([]);
    setStep(0);
    setReveal(null);
  }

  if (step >= total) {
    const rows = order.map((idx, k) => ({ s: SCENARIOS[idx], grade: SCENARIOS[idx].choices[picks[k]].grade }));
    const score = rows.filter((r) => r.grade === "tepat").length;
    const verdict =
      score >= total - 1
        ? "Instingmu tajam. Ajak teman yang paling sering dapat tawaran aneh untuk mencoba juga."
        : score >= total / 2
          ? "Sudah bagus. Perhatikan lagi situasi yang masih meleset di bawah."
          : "Tidak apa-apa, justru ini gunanya latihan. Baca lagi tanda-tanda di situasi yang meleset, lalu coba sekali lagi.";
    return (
      <section className="panel enter p-5 @min-[592px]:p-8" aria-labelledby="skor">
        <h2 id="skor" ref={front} tabIndex={-1} className="scroll-mt-8 text-3xl font-extrabold tracking-tight @min-[592px]:text-4xl">
          Kamu tepat di{" "}
          <mark className="hl">
            {score} dari {total}
          </mark>{" "}
          situasi.
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">{verdict}</p>
        <ul className="mt-8 divide-y-2 divide-line border-y-2 border-line">
          {rows.map(({ s, grade }) => (
            <li key={s.id} className="flex flex-col gap-1 py-4 @min-[592px]:flex-row @min-[592px]:items-baseline @min-[592px]:gap-6">
              <span className="w-32 flex-none font-bold" style={{ color: VERDICT[grade].color }}>
                {VERDICT[grade].title}
              </span>
              <span>
                <span className="font-bold">{s.title}</span>
                {grade !== "tepat" && <span className="mt-1 block leading-relaxed text-muted">{s.tells[0]}</span>}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" className="btn btn-main" onClick={restart}>
            Ulangi dengan urutan acak
          </button>
          <Link href="/periksa" className="btn">
            Periksa pesan sungguhan
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <p className="flex-none text-sm font-bold tabular-nums">
          Situasi {step + 1} dari {total}
        </p>
        <div className="bar flex-1" role="progressbar" aria-label="Kemajuan latihan" aria-valuemin={0} aria-valuemax={total} aria-valuenow={picks.length}>
          <span style={{ transform: `scaleX(${picks.length / total})` }} />
        </div>
      </div>

      <div className="flip mt-5" data-flipped={flipped}>
        <div
          className="flip-inner"
          onTransitionEnd={(e) => {
            // Once the card is face-up again, drop the old answer so it stops stretching the card.
            if (e.target === e.currentTarget && !flipped) setReveal(null);
          }}
        >
          <section className="panel p-5 @min-[592px]:p-8" inert={flipped} aria-labelledby="situasi">
            <p className="text-sm font-semibold text-muted">Situasinya</p>
            <h2 id="situasi" ref={front} tabIndex={-1} className="mt-1 scroll-mt-24 text-xl leading-snug font-bold text-balance">
              {scenario.context}
            </h2>
            <Thread s={scenario} />
            <h3 className="mt-7 font-bold">Apa yang kamu lakukan?</h3>
            <div className="mt-3 space-y-3">
              {scenario.choices.map((c, i) => (
                <button key={c.text} type="button" className="choice" onClick={() => choose(i)}>
                  {c.text}
                </button>
              ))}
            </div>
          </section>

          <section className="panel flip-back p-5 @min-[592px]:p-8" inert={!flipped} aria-labelledby="umpan-balik">
            {reveal && <Answer {...reveal} heading={back} onNext={next} last={step === total - 1} />}
          </section>
        </div>
      </div>
    </div>
  );
}

function Thread({ s, marked }: { s: Scenario; marked?: boolean }) {
  return (
    <div className="mt-5 rounded-2xl border-2 border-line bg-card">
      <div className="flex items-center justify-between gap-3 border-b-2 border-line px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-bold">{s.from}</p>
          <p className="truncate text-sm text-muted">{s.sub}</p>
        </div>
        <span className="flex-none rounded-md border-2 border-line px-2 py-0.5 text-xs font-bold">{s.channel}</span>
      </div>
      <div className="space-y-2.5 p-4">
        {s.messages.map((m) => (
          <p key={m} className="bubble">
            {marked ? <Marked text={m} spans={analyze(m).spans} /> : m}
          </p>
        ))}
        {s.file && (
          <p className="bubble flex items-center gap-2 font-semibold">
            <svg viewBox="0 0 16 16" className="h-4 w-4 flex-none" fill="none" aria-hidden>
              <path d="M4 1.5h5l3.5 3.5v9.5H4z M9 1.5V5h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            <span className="break-all">{marked ? <Marked text={s.file} spans={analyze(s.file).spans} /> : s.file}</span>
          </p>
        )}
      </div>
    </div>
  );
}

function Answer({
  s,
  p,
  heading,
  onNext,
  last,
}: {
  s: Scenario;
  p: number;
  heading: React.RefObject<HTMLHeadingElement | null>;
  onNext: () => void;
  last: boolean;
}) {
  const choice = s.choices[p];
  const best = s.choices.find((c) => c.grade === "tepat");
  return (
    <div>
      <p className="text-sm font-semibold text-muted">Kamu memilih: {choice.text}</p>
      <h2
        id="umpan-balik"
        ref={heading}
        tabIndex={-1}
        className="mt-1 scroll-mt-16 text-3xl font-extrabold tracking-tight"
        style={{ color: VERDICT[choice.grade].color }}
      >
        {VERDICT[choice.grade].title}
      </h2>
      <p className="mt-3 text-lg leading-relaxed">{choice.feedback}</p>
      {choice.grade !== "tepat" && best && (
        <p className="mt-3 leading-relaxed">
          <span className="font-bold">Pilihan paling aman:</span> {best.text}.
        </p>
      )}

      <h3 className="mt-7 font-bold">{s.scam ? "Tanda yang perlu kamu perhatikan" : "Kenapa yang ini wajar"}</h3>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed">
        {s.tells.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>

      {s.scam && <Thread s={s} marked />}

      <button type="button" className="btn btn-main mt-7" onClick={onNext}>
        {last ? "Lihat hasil latihan" : "Situasi berikutnya"}
      </button>
    </div>
  );
}
