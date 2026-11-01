"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { routeOf } from "@/lib/desk";

// The page lying on the desk. Real HTML, so forms, links and screen readers work as on any page.
export default function Lembar({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const route = routeOf(path);
  const [full, setFull] = useState(false);
  const label = full ? "Kembali ke meja" : "Layar penuh";

  return (
    <div id="lembar" className="lembar-wrap" data-page={route} data-full={full && route !== "home"}>
      {/* Keyed by page, so each one starts at its top and slides in as a new sheet.
          No container on home: it would become the box its labels' position: fixed is measured from. */}
      <main key={path} id="isi" tabIndex={0} className={route === "home" ? "lembar" : "lembar @container"}>
        {children}
      </main>
      {route !== "home" && (
        <button type="button" className="btn lembar-size" aria-label={label} title={label} onClick={() => setFull(!full)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d={full ? "M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" : "M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6"} />
          </svg>
        </button>
      )}
    </div>
  );
}
