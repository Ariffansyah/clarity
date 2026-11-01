"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// The route behind this is real: closing is going back, and a direct visit shows the full page instead.
export default function PhoneModal({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  // Once someone has started using the feature, a stray click outside must not throw their work away.
  const used = useRef(false);
  const [full, setFull] = useState(false);
  const sizeLabel = full ? "Kecilkan pop-up" : "Layar penuh";

  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
    return () => d?.close();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="pm"
      data-full={full}
      aria-labelledby="pm-title"
      onCancel={(e) => {
        e.preventDefault();
        router.back();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) {
          if (!used.current) router.back();
        } else {
          used.current = true;
        }
      }}
    >
      <div className="phone pm-phone">
        <div className="phone-screen pm-screen">
          <header className="pm-bar">
            <div className="min-w-0">
              <h2 id="pm-title" className="truncate text-lg font-extrabold tracking-tight">
                {title}
              </h2>
              {note && <p className="hand block truncate text-base">{note}</p>}
            </div>
            <div className="flex flex-none gap-2">
              <button
                type="button"
                className="btn pm-close pm-size"
                aria-label={sizeLabel}
                title={sizeLabel}
                onClick={(e) => {
                  e.stopPropagation(); // resizing is not "using the feature", so a click outside can still close
                  setFull(!full);
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={full ? "M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" : "M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6"} />
                </svg>
              </button>
              <button type="button" className="btn pm-close" onClick={() => router.back()}>
                Tutup
              </button>
            </div>
          </header>
          <div className="pm-body @container">{children}</div>
        </div>
      </div>
    </dialog>
  );
}
