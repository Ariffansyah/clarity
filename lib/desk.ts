// The desk world's rules. No Three.js here, so they can be tested in plain Node.

export type Route = "home" | "periksa" | "latihan" | "simulasi" | "bertindak" | "lain";

export function routeOf(path: string): Route {
  if (path === "/") return "home";
  const first = path.split("/")[1];
  return first === "periksa" || first === "latihan" || first === "simulasi" || first === "bertindak" ? first : "lain";
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

export const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** Sorot's idle motion at time t seconds: a slow tail swish, a blink, and now and then a wave. */
export function catPose(t: number) {
  const blink = (t % 4.5) / 4.5;
  const wave = (t % 7) / 7;
  return {
    tail: Math.sin((t * 2 * Math.PI) / 3) * 0.17,
    eyes: blink > 0.95 && blink < 0.99 ? 0.1 : 1,
    arm: wave > 0.8 ? Math.sin(((wave - 0.8) / 0.2) * 4 * Math.PI) * 0.25 : 0,
  };
}
