"use client";

import { useState } from "react";
import { KATA, LOCKS } from "@/lib/kunci";

const TOTAL = LOCKS.reduce((n, g) => n + g.items.length, 0);

export function Checklist() {
  const [done, setDone] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    const next = new Set(done);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setDone(next);
  }

  return (
    <section className="panel taped p-5 @min-[592px]:p-8" aria-labelledby="daftar">
      <h2 id="daftar" className="text-2xl leading-tight font-extrabold tracking-tight text-balance @min-[592px]:text-3xl">
        Yang perlu dinyalakan
      </h2>
      <div className="mt-4 flex items-center gap-4">
        <div className="bar flex-1" aria-hidden>
          <span style={{ transform: `scaleX(${done.size / TOTAL})` }} />
        </div>
        <p className="flex-none text-sm font-bold tabular-nums" aria-live="polite">
          {done.size === TOTAL ? "Semua terkunci" : `${done.size} dari ${TOTAL} terkunci`}
        </p>
      </div>

      {LOCKS.map((g) => (
        <div key={g.group} className="mt-8">
          <h3 className="font-extrabold">{g.group}</h3>
          <ul className="mt-3 space-y-5">
            {g.items.map((l) => (
              <li key={l.id} className={done.has(l.id) ? "check-row is-done" : "check-row"}>
                <div className="flex gap-3">
                  <input id={l.id} type="checkbox" className="check" checked={done.has(l.id)} onChange={() => toggle(l.id)} />
                  <div>
                    <label htmlFor={l.id} className="done-text cursor-pointer font-bold">
                      {l.title}
                    </label>
                    <p className="mt-1 leading-relaxed text-muted">{l.why}</p>
                    <p className="mt-2 text-sm leading-relaxed">
                      <span className="font-bold">Caranya: </span>
                      {l.how}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

const PESAN =
  "Halo semua. Sekarang suara, bahkan wajah, bisa ditiru AI dari video pendek. Ayo kita sepakati kata sandi keluarga. Kalau ada telepon, video call, atau chat atas nama salah satu dari kita yang bilang darurat dan minta uang, tanyakan kata sandinya dulu. Kalau tidak bisa menjawab, tutup, lalu telepon nomor yang biasa. Kata sandinya aku sampaikan langsung, bukan lewat chat.";

export function KataSandi() {
  // Empty until asked for, so the server and the browser render the same thing.
  const [kata, setKata] = useState<string | null>(null);

  function acak() {
    const [a, b] = crypto.getRandomValues(new Uint32Array(2));
    setKata(`${KATA.benda[a % KATA.benda.length]} ${KATA.sifat[b % KATA.sifat.length]}`);
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[18px] border-2 border-line p-5 @min-[592px]:p-7">
        <p className="font-bold">Usulan kata sandi</p>
        <p className="hand mt-2 block min-h-12 text-4xl" aria-live="polite">
          {kata ?? "…"}
        </p>
        <button type="button" className="btn btn-main mt-4" onClick={acak}>
          {kata ? "Acak lagi" : "Buat usulan"}
        </button>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Atau pilih sendiri yang hanya keluarga tahu. Sampaikan langsung atau lewat telepon, jangan ditulis di chat: kalau
          akun chat-mu dibajak, pelaku ikut membacanya.
        </p>
      </div>

      <div>
        <p className="font-bold">Pesan untuk grup keluarga</p>
        <blockquote className="mt-3 rounded-xl border-2 border-line bg-paper p-4 leading-relaxed">{PESAN}</blockquote>
        <a className="btn mt-4" href={`https://wa.me/?text=${encodeURIComponent(PESAN)}`} target="_blank" rel="noopener noreferrer">
          Kirim lewat WhatsApp
        </a>
      </div>
    </div>
  );
}
