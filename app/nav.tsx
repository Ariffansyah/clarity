"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ViewTransition } from "react";

// Hand-drawn-weight icons in the same 2px ink as the rest of the UI.
const ICONS = {
  cek: (
    <>
      <path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M7 10.5l10-1.5" strokeWidth="3.2" />
    </>
  ),
  latihan: (
    <>
      <rect x="3" y="7" width="13" height="14" rx="2" />
      <path d="M8 3.5h11a2 2 0 0 1 2 2V17M6.5 14l2.2 2.2 4-4.2" />
    </>
  ),
  simulasi: (
    <>
      <path d="M4 3.5h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9l-4 3.5v-3.5H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z" />
      <path d="M19 8.5h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1V21l-4-3.5h-3a2 2 0 0 1-2-2" />
    </>
  ),
  terlanjur: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7 9l2 2 3.5-3.5M7 15.5h10" />
    </>
  ),
};

const LINKS = [
  { href: "/periksa", label: "Cek pesan", icon: ICONS.cek },
  { href: "/latihan", label: "Latihan", icon: ICONS.latihan },
  { href: "/simulasi", label: "Simulasi", icon: ICONS.simulasi },
  { href: "/bertindak", label: "Sudah terlanjur?", icon: ICONS.terlanjur },
];

// One nav for every size: a pill in the header on wide screens, a bottom tab bar on phones.
export default function Nav() {
  const path = usePathname();
  return (
    <nav aria-label="Utama" className="nav">
      <ul>
        {LINKS.map((l) => {
          const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link href={l.href} aria-current={active ? "page" : undefined} className="nav-link">
                {active && (
                  // Same name on every tab, so the marker slides to the new tab on navigation.
                  <ViewTransition name="nav-mark">
                    <span className="nav-mark" aria-hidden />
                  </ViewTransition>
                )}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {l.icon}
                </svg>
                <span className="relative">{l.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
