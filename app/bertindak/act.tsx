"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CHANNELS, SITUATIONS, WARNINGS, type Step } from "@/lib/situations";

const WHEN: Step["when"][] = ["Sekarang juga", "Hari ini", "Setelahnya"];

function useHash() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("hashchange", cb);
      return () => window.removeEventListener("hashchange", cb);
    },
    () => window.location.hash.slice(1),
    () => "",
  );
}

export function Guide() {
  const hash = useHash();
  // The URL hash picks the situation. Remember the last one so jumping to #peringatkan keeps it open.
  const [last, setLast] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const list = useRef<HTMLDivElement>(null);
  const fromHash = SITUATIONS.find((s) => s.id === hash);
  if (fromHash && fromHash.id !== last) setLast(fromHash.id);
  const current = fromHash ?? SITUATIONS.find((s) => s.id === last);

  function pick(id: string) {
    history.replaceState(null, "", `#${id}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    requestAnimationFrame(() => {
      list.current?.scrollIntoView({ block: "start" });
      list.current?.focus({ preventScroll: true });
    });
  }

  function toggle(key: string) {
    const next = new Set(done);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setDone(next);
  }

  const count = current ? current.steps.filter((_, i) => done.has(`${current.id}:${i}`)).length : 0;

  return (
    <div className="grid items-start gap-8 @min-[976px]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] @min-[976px]:gap-12">
      <div className="@min-[976px]:sticky @min-[976px]:top-6">
        <h2 className="font-bold">Apa yang terjadi?</h2>
        <div className="mt-3 grid gap-2.5 @min-[592px]:grid-cols-2 @min-[976px]:grid-cols-1">
          {SITUATIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={current?.id === s.id}
              onClick={() => pick(s.id)}
              className="choice aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:shadow-none aria-pressed:hover:translate-0"
            >
              {s.title}
            </button>
          ))}
        </div>
      </div>

      <div ref={list} tabIndex={-1} className="scroll-mt-4 outline-none">
        {current ? (
          <section key={current.id} className="panel taped enter p-5 @min-[592px]:p-8" aria-labelledby="langkah">
            <h2 id="langkah" className="text-2xl leading-tight font-extrabold tracking-tight text-balance @min-[592px]:text-3xl">
              {current.title}
            </h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="bar flex-1" aria-hidden>
                <span style={{ transform: `scaleX(${count / current.steps.length})` }} />
              </div>
              <p className="flex-none text-sm font-bold tabular-nums" aria-live="polite">
                {count === current.steps.length ? "Semua langkah selesai" : `${count} dari ${current.steps.length} selesai`}
              </p>
            </div>

            {WHEN.map((when) => {
              const steps = current.steps.map((s, i) => ({ s, key: `${current.id}:${i}` })).filter(({ s }) => s.when === when);
              if (steps.length === 0) return null;
              return (
                <div key={when} className="mt-8">
                  <h3 className="inline-block font-extrabold" style={when === "Sekarang juga" ? { color: "var(--danger)" } : undefined}>
                    {when}
                  </h3>
                  <ul className="mt-3 space-y-4">
                    {steps.map(({ s, key }) => (
                      <li key={key} className={done.has(key) ? "is-done" : undefined}>
                        <div className="flex gap-3">
                          <input id={key} type="checkbox" className="check" checked={done.has(key)} onChange={() => toggle(key)} />
                          <div>
                            <label htmlFor={key} className="done-text cursor-pointer font-bold">
                              {s.title}
                            </label>
                            <p className="mt-1 leading-relaxed text-muted">{s.detail}</p>
                            {s.link && (
                              <a
                                href={s.link.href}
                                {...(s.link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                className="mt-2 inline-flex min-h-11 items-center rounded-md font-bold underline decoration-2 underline-offset-4 transition-colors hover:bg-[var(--hl-bg)]"
                              >
                                {s.link.label}
                              </a>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        ) : (
          <div className="rounded-[18px] border-2 border-dashed border-line p-8 text-center leading-relaxed text-muted">
            Pilih kejadian yang paling mirip. Langkah-langkahnya muncul di sini, diurutkan dari yang paling mendesak.
          </div>
        )}
      </div>
    </div>
  );
}

const build = (id: string, personal: boolean) => {
  const w = WARNINGS.find((x) => x.id === id) ?? WARNINGS[0];
  return `${personal ? "Aku barusan hampir kena, jadi mau ngingetin. " : ""}Hati-hati ya, lagi banyak modus ${w.name.toLowerCase()}. Ciri-cirinya: ${w.ciri}. Kalau dapat yang begini, jangan ${w.jangan}. Kalau ragu, tanya dulu ke orang yang kamu percaya sebelum transfer atau klik apa pun.`;
};

export function Composer() {
  const [modus, setModus] = useState(WARNINGS[0].id);
  const [personal, setPersonal] = useState(false);
  const [text, setText] = useState(() => build(WARNINGS[0].id, false));
  const [copy, setCopy] = useState<"idle" | "ok" | "fail">("idle");
  const area = useRef<HTMLTextAreaElement>(null);
  const timer = useRef<number>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function update(m: string, p: boolean) {
    setModus(m);
    setPersonal(p);
    setText(build(m, p));
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setCopy("ok");
    } catch {
      setCopy("fail");
      area.current?.select();
    }
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopy("idle"), 3000);
  }

  const empty = !text.trim();

  return (
    <div className="grid gap-8 @min-[976px]:grid-cols-2 @min-[976px]:gap-12">
      <div>
        <fieldset>
          <legend className="font-bold">Modus apa yang mau kamu ceritakan?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {WARNINGS.map((w) => (
              <button key={w.id} type="button" className="chip" aria-pressed={modus === w.id} onClick={() => update(w.id, personal)}>
                <svg viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {w.name}
              </button>
            ))}
          </div>
        </fieldset>
        <label className="mt-6 flex cursor-pointer items-start gap-3">
          <input type="checkbox" className="check" checked={personal} onChange={(e) => update(modus, e.target.checked)} />
          <span className="leading-relaxed">Ceritakan bahwa aku sendiri hampir kena</span>
        </label>
      </div>

      <div>
        <label htmlFor="peringatan" className="font-bold">
          Pesanmu <span className="font-normal text-muted">Boleh diubah sesukamu.</span>
        </label>
        <textarea id="peringatan" ref={area} className="field mt-3 min-h-52" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-main" onClick={copyText} disabled={empty}>
            {copy === "ok" ? "Tersalin" : "Salin pesan"}
          </button>
          <a
            className="btn"
            href={empty ? undefined : `https://wa.me/?text=${encodeURIComponent(text)}`}
            aria-disabled={empty}
            target="_blank"
            rel="noopener noreferrer"
          >
            Kirim lewat WhatsApp
          </a>
        </div>
        <p className="mt-3 min-h-6 text-sm text-muted" aria-live="polite">
          {copy === "fail" && "Browser menolak menyalin otomatis. Teksnya sudah dipilih, tinggal salin manual."}
          {empty && "Pesannya kosong. Pilih salah satu modus untuk mengisinya lagi."}
        </p>
      </div>
    </div>
  );
}

export function Channels() {
  return (
    <ul className="divide-y-2 divide-line border-y-2 border-line">
      {CHANNELS.map((c) => (
        <li key={c.name} className="grid gap-1 py-5 @min-[592px]:grid-cols-[1fr_auto] @min-[592px]:items-center @min-[592px]:gap-6">
          <div>
            <p className="font-bold">{c.name}</p>
            <p className="mt-0.5 leading-relaxed text-muted">{c.use}</p>
          </div>
          <a
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-self-start rounded-md px-1 font-bold underline decoration-2 underline-offset-4 transition-colors hover:bg-[var(--hl-bg)] @min-[592px]:justify-self-end"
          >
            {c.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
