"use client";

import { analyze } from "@/lib/analyze";
import Marked from "./marked";

// The real analyzer output for a fictional message, so the illustration shows exactly what the tool does.
const TEXT =
  "Nasabah Yth, akun m-banking Anda akan diblokir dalam 24 jam karena perubahan tarif transfer. Segera konfirmasi di nusantara-tarif-baru.top/konfirmasi";
const SPANS = analyze(TEXT).spans;

// Notes sit outside the phone or in the blank space under the message, never over the text.
const NOTES = [
  { text: "diancam diblokir?", cls: "n1", arrow: "M46 4C32 4 18 10 8 20M8 20l1-8M8 20l8-2", before: true },
  { text: "kok buru-buru?", cls: "n2", arrow: "M2 22C16 22 30 16 40 4M40 4l-8 1M40 4l-1 8", before: false },
  { text: "link aneh!", cls: "n3", arrow: "M46 22C30 22 16 16 8 4M8 4l1 8M8 4l8 1", before: true },
];

function tilt(e: React.PointerEvent<HTMLDivElement>) {
  if (e.pointerType !== "mouse") return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 18}deg`);
  e.currentTarget.style.setProperty("--rx", `${-((e.clientY - r.top) / r.height - 0.5) * 12}deg`);
}

function settle(e: React.PointerEvent<HTMLDivElement>) {
  e.currentTarget.style.setProperty("--ry", "0deg");
  e.currentTarget.style.setProperty("--rx", "0deg");
}

export default function Phone() {
  return (
    <div className="phone-stage" aria-hidden onPointerMove={tilt} onPointerLeave={settle}>
      <div className="phone-rig">
        <div className="phone">
          <div className="phone-screen">
            <div className="flex items-center gap-2.5 border-b-2 border-line px-3.5 py-3">
              <span className="grid h-8 w-8 flex-none place-items-center rounded-full border-2 border-line font-extrabold">?</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">+62 812-xxxx-0077</span>
                <span className="block text-xs text-muted">SMS · baru saja</span>
              </span>
            </div>
            <div className="p-3.5">
              <p className="bubble text-[0.82rem] leading-[1.75]">
                <Marked text={TEXT} spans={SPANS} />
              </p>
              <p className="mt-1.5 text-right text-xs text-muted">09.41</p>
            </div>
          </div>
        </div>
        {NOTES.map((n) => (
          <span key={n.text} className={`note ${n.cls}`}>
            {n.before && <Arrow d={n.arrow} />}
            {n.text}
            {!n.before && <Arrow d={n.arrow} />}
          </span>
        ))}
      </div>
    </div>
  );
}

function Arrow({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 48 26" className="h-5 w-10 flex-none" fill="none">
      <path d={d} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
