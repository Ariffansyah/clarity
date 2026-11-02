// The desk world's rules. No Three.js here, so they can be tested in plain Node.

export type Route = "home" | "periksa" | "latihan" | "simulasi" | "amankan" | "bertindak" | "peta" | "lain";

export function routeOf(path: string): Route {
  if (path === "/") return "home";
  const first = path.split("/")[1];
  return first === "periksa" || first === "latihan" || first === "simulasi" || first === "amankan" || first === "bertindak" || first === "peta" ? first : "lain";
}

/** Where a page's on-screen box sits on a camera-facing plane `dist` in front of the camera. */
export function planeFromRect(
  rect: { left: number; top: number; width: number; height: number },
  viewW: number,
  viewH: number,
  fovDeg: number,
  dist: number,
) {
  const unit = (2 * dist * Math.tan((fovDeg * Math.PI) / 360)) / viewH;
  return {
    x: (rect.left + rect.width / 2 - viewW / 2) * unit,
    y: (viewH / 2 - rect.top - rect.height / 2) * unit,
    w: rect.width * unit,
    h: rect.height * unit,
    unit,
  };
}

/** Where an open page sits on screen: below the way back to the desk, and tablet-shaped (3:4) for the chat simulation. */
export function pageRect(route: Route, viewW: number, viewH: number) {
  const narrow = viewW < 768;
  const side = narrow ? 20 : 24;
  const top = 72; // room for the way back to the desk
  const room = viewH - top - (narrow ? 40 : 72); // the page is seen leaning, so its near edge needs room to grow
  const width = Math.min(route === "simulasi" ? Math.round(room * 0.75) : 680, viewW - side * 2);
  // On a phone the tablet stands as tall as the screen allows, so its chat gets the whole screen.
  const height = Math.round(route === "simulasi" && !narrow ? Math.min(room, width * 1.75) : room);
  return { left: Math.round((viewW - width) / 2), top: top + Math.round((room - height) / 2), width, height };
}

export const easeOut = (t: number) => 1 - (1 - t) ** 3;

export const RING = 7; // seconds between messages arriving on the desk phone

/** The desk phone at time t seconds. Each RING a new message arrives: the phone buzzes for a moment, its screen lights
 * up with the notification sliding in, and it goes dark again a few seconds later. */
export function phonePose(t: number) {
  const s = t % RING;
  return {
    message: Math.floor(t / RING),
    buzz: s < 0.7 ? Math.sin(s * 90) * 0.035 * (1 - s / 0.7) : 0,
    lit: s < 4.6 ? Math.min(1, s / 0.15) : Math.max(0, 1 - (s - 4.6) / 0.5),
    drop: Math.min(1, s / 0.35),
  };
}
