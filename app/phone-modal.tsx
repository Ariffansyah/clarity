"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// The route behind this is real: closing is going back, and a direct visit shows the full page instead.
export default function PhoneModal({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  // Once someone has started using the feature, a stray click outside must not throw their work away.
  const used = useRef(false);

  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
    return () => d?.close();
  }, []);

  return (
    <dialog
      ref={dialog}
      className="pm"
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
            <button type="button" className="btn pm-close" onClick={() => router.back()}>
              Tutup
            </button>
          </header>
          <div className="pm-body @container">{children}</div>
        </div>
      </div>
    </dialog>
  );
}
