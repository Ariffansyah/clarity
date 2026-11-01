"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { routeOf } from "@/lib/desk";

type Running = { go: (r: ReturnType<typeof routeOf>) => void; stop: () => void };

// Lives in the root layout, so the desk never reloads: pages only change what lies on it.
// Purely decoration on top of real HTML; without WebGL the pages still work as ordinary pages.
export default function World() {
  const path = usePathname();
  const router = useRouter();
  const canvas = useRef<HTMLCanvasElement>(null);
  const world = useRef<Running | null>(null);
  const current = useRef(path);

  useEffect(() => {
    current.current = path;
    world.current?.go(routeOf(path));
  }, [path]);

  useEffect(() => {
    let gone = false;
    const root = document.documentElement;
    const dark = matchMedia("(prefers-color-scheme: dark)");
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
    dark.addEventListener("change", start); // the scene's colours come from the theme
    return () => {
      gone = true;
      dark.removeEventListener("change", start);
      world.current?.stop();
      world.current = null;
      delete root.dataset.world;
    };
  }, [router]);

  return <canvas ref={canvas} className="world" aria-hidden />;
}
