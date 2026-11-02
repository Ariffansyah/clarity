"use client";

import { useEffect, useSyncExternalStore } from "react";
import { analyze } from "@/lib/analyze";
import { STAGES } from "@/lib/peta";
import Marked from "../marked";

const onHash = (on: () => void) => {
  addEventListener("hashchange", on);
  return () => removeEventListener("hashchange", on);
};

// The map, unfolded on the pinboard: a red-pen route down the left, a card at each stop.
export default function Peta() {
  // Read after the router has written the new address, so a link from Cek Pesan lands lit too.
  const here = useSyncExternalStore(onHash, () => location.hash.slice(1), () => "");

  // Keep the linked stop in view inside the page's own scroller until the reader takes over:
  // the desk lays the page out again at its own size once it has loaded.
  useEffect(() => {
    const stop = STAGES.some((s) => s.id === here) ? document.getElementById(here) : null;
    const page = document.getElementById("isi");
    if (!stop || !page) return;
    const keep = new ResizeObserver(() => stop.scrollIntoView({ block: "start" }));
    const done = () => keep.disconnect();
    const inputs = ["wheel", "touchstart", "keydown", "pointerdown"];
    for (const el of [page, ...page.children]) keep.observe(el); // the page's contents can reflow after its box has settled
    for (const e of inputs) addEventListener(e, done, { once: true, passive: true });
    return () => {
      done();
      for (const e of inputs) removeEventListener(e, done);
    };
  }, [here]);

  return (
    <div className="peta-map mt-10">
      <ol className="peta">
        {STAGES.map((s, n) => (
          <li key={s.id} id={s.id} className="peta-stop" data-here={here === s.id}>
            <span className="peta-no" aria-hidden>
              {n + 1}
            </span>
            <article className="peta-card" aria-labelledby={`judul-${s.id}`}>
              <h2 id={`judul-${s.id}`} className="text-2xl font-extrabold tracking-tight @min-[592px]:text-3xl">
                {here === s.id ? <mark className="hl">{s.name}</mark> : s.name}
              </h2>
              <p className="mt-1 text-lg leading-snug font-semibold">{s.def}</p>

              <h3 className="mt-5 font-bold">Kenapa berhasil</h3>
              <p className="mt-1 leading-relaxed">{s.why}</p>

              <h3 className="mt-5 font-bold">Contohnya</h3>
              <div className="mt-2 space-y-2.5">
                {s.examples.map((e) => (
                  <p key={e.text} className="bubble break-words">
                    <span className="block text-xs font-bold text-muted">{e.from}</span>
                    {/* Only this stop's part is marked, so each bubble shows what the stop looks like in a real message. */}
                    <Marked text={e.text} spans={analyze(e.text).spans.filter((sp) => s.rules.includes(sp.rule))} />
                  </p>
                ))}
              </div>

              <div className="mt-5 border-t-2 border-dashed border-line pt-4">
                <h3 className="font-bold text-good">Cara mematahkannya</h3>
                <p className="mt-1 leading-relaxed">{s.counter}</p>
              </div>
            </article>
          </li>
        ))}
      </ol>
      <p className="hand peta-note">
        Tidak semua tipuan memakai kelima bagian ini, dan urutannya bisa berubah. Tapi kalau dua atau tiga muncul
        bersamaan, itu tanda untuk berhenti.
      </p>
    </div>
  );
}
