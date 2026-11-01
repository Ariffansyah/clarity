"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routeOf } from "@/lib/desk";

// The page, lying on its thing on the desk. Real HTML, so forms, links and screen readers work as on any page.
// The bits of the thing itself (a letterhead, a tablet's status bar) only show while the desk is running.
export default function Lembar({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const route = routeOf(path);

  return (
    <>
      {/* No nav bar: the desk is the menu. Outside the page, so it stays put while the page moves in 3D. */}
      {route !== "home" && (
        <Link href="/" className="btn lembar-back" aria-keyshortcuts="Escape">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          Kembali ke meja
          <kbd aria-hidden>Esc</kbd>
        </Link>
      )}
      <div id="lembar" className="lembar-wrap" data-page={route}>
        {route === "simulasi" && <StatusBar />}
        {/* Keyed by page, so each one starts at its top.
            No container on home: it would become the box its labels' position: fixed is measured from. */}
        <main key={path} id="isi" tabIndex={0} className={route === "home" ? "lembar" : "lembar @container"}>
          {route === "periksa" && <Letterhead />}
          {children}
        </main>
        {route === "simulasi" && <span className="tab-home" aria-hidden />}
      </div>
    </>
  );
}

// The printout's head: whose sheet it is, over a double rule.
function Letterhead() {
  return (
    <div className="kop" aria-hidden>
      <span className="flex items-center gap-2">
        <svg viewBox="0 0 32 32" width="26" height="26">
          <path d="M7 3.5h18a4 4 0 0 1 4 4v11a4 4 0 0 1-4 4H14.5L8 28.5v-6H7a4 4 0 0 1-4-4v-11a4 4 0 0 1 4-4z" fill="var(--ink)" />
          <path d="M7.2 10.6 24.9 8.5l.7 5.7-17.7 2.1z" fill="#ffd84a" />
          <path d="M8.8 19h9" stroke="var(--paper)" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Clarity
      </span>
      <span>Lembar cek pesan</span>
    </div>
  );
}

// The tablet's own top line. 09.41, as on the example SMS elsewhere in the app.
function StatusBar() {
  return (
    <div className="tab-status" aria-hidden>
      <span>09.41</span>
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 18 12" width="18" height="12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg viewBox="0 0 16 12" width="16" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M1.5 4.5a9.5 9.5 0 0 1 13 0M4 7.3a6 6 0 0 1 8 0" />
          <circle cx="8" cy="10" r="1.2" fill="currentColor" stroke="none" />
        </svg>
        <svg viewBox="0 0 26 12" width="26" height="12" fill="none">
          <rect x="1" y="1" width="21" height="10" rx="3" stroke="currentColor" strokeWidth="1.6" />
          <rect x="3" y="3" width="13" height="6" rx="1.5" fill="currentColor" />
          <path d="M24 4.5v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
}
