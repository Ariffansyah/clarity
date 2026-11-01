"use client";

import { useSyncExternalStore } from "react";

const watch = (change: () => void) => {
  const o = new MutationObserver(change);
  o.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => o.disconnect();
};
const isDark = () => document.documentElement.dataset.theme === "dark";

// Day or night at the desk. The choice stays on this device; until one is made, the system's setting decides.
export default function Tema() {
  const dark = useSyncExternalStore(watch, isDark, () => false);
  const label = dark ? "Ganti ke mode terang" : "Ganti ke mode gelap";

  return (
    <button
      type="button"
      className="btn tema"
      aria-label="Mode gelap"
      aria-pressed={dark}
      title={label}
      onClick={() => {
        const next = dark ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem("tema", next);
        } catch {
          // private mode or blocked storage: the switch still works until the tab closes
        }
      }}
    >
      {/* Shows where the switch takes you: the moon by day, the sun by night. */}
      <svg className="bulan" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
      </svg>
      <svg className="matahari" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
      </svg>
    </button>
  );
}
