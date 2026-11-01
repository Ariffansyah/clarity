"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { routeOf } from "@/lib/desk";

type Running = { go: (r: ReturnType<typeof routeOf>) => void; stop: () => void };

// Lives in the root layout, so the desk never reloads: opening a page only moves the camera to it.
// Purely decoration on top of real HTML; without WebGL the pages still work as ordinary pages.
export default function World() {
  const path = usePathname();
  const router = useRouter();
  const canvas = useRef<HTMLCanvasElement>(null);
  const world = useRef<Running | null>(null);
  const current = useRef(path);

  // Before paint, so a new page is never seen before it is laid on its thing.
  useLayoutEffect(() => {
    current.current = path;
    world.current?.go(routeOf(path));
  }, [path]);

  useEffect(() => {
    let gone = false;
    const root = document.documentElement;
    const theme = new MutationObserver(() => start()); // the scene's colours come from the theme
    const start = () =>
      import("./world-scene")
        .then(({ startWorld }) => {
          if (gone || !canvas.current) return;
          world.current?.stop();
          world.current = startWorld(canvas.current, () => document.getElementById("lembar"), routeOf(current.current), (href) => router.push(href));
          root.dataset.world = "on";
        })
        .catch(() => {
          delete root.dataset.world; // no WebGL, or the download failed
        });
    start();
    theme.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      gone = true;
      theme.disconnect();
      world.current?.stop();
      world.current = null;
      delete root.dataset.world;
    };
  }, [router]);

  return <canvas ref={canvas} className="world" aria-hidden />;
}
