import * as THREE from "three";
import { easeOut, pageRect, planeFromRect, type Route } from "@/lib/desk";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { INK, inkPass } from "./world-ink";
import { buildPhone } from "./world-phone";

const FLY = 1; // seconds for the camera to move between your chair and a page on the desk, the thing opening on the way

type Spot = [x: number, z: number];

// Every page is a thing on the desk. Click one and you lean in to read it right where it lies.
// `narrow` is where it lies on a phone: across the screen (-1 to 1, so the two columns of labels never meet on any
// phone) and depth on the desk, the standing tablet at the back so it hides no label. `lean` is how far from square on you see it while
// reading, in radians: towards you over a page lying flat, a little round the side of the tablet.
// A thing with no `narrow` spot hangs on the wall, right where `wide` puts it, and only on wide screens: a phone sees
// the wall only behind the home page's text.
const THINGS: { model: string; name: string; href: string; wide: Spot; narrow?: Spot; lean: [pitch: number, yaw: number] }[] = [
  { model: "printout", name: "Cek Pesan", href: "/periksa", wide: [-0.6, -0.03], narrow: [-0.5, -0.02], lean: [0.26, 0] },
  { model: "cards", name: "Latihan", href: "/latihan", wide: [-0.2, -0.23], narrow: [0.5, -0.42], lean: [0.26, 0] },
  { model: "tablet", name: "Simulasi", href: "/simulasi", wide: [0.2, -0.24], narrow: [-0.5, -0.45], lean: [-0.06, 0.14] },
  { model: "clipboard", name: "Amankan Akun", href: "/amankan", wide: [0, 0.2], narrow: [0.5, -0.02], lean: [0.26, 0] },
  { model: "folder", name: "Sudah Terlanjur?", href: "/bertindak", wide: [0.66, 0.04], narrow: [0, 0.36], lean: [0.26, 0] },
  { model: "pinboard", name: "Peta Tipuan", href: "/peta", wide: [-0.62, -0.97], lean: [-0.06, 0.12] },
];

const PHONE = { wide: [-0.95, -0.42], narrow: [0, -0.52] } as const;
const TABLET_TOP = 0.23; // how high the tablet stands on a phone's desk

// Phones look down at the desk this steeply (radians below level), so the standing tablet hides little behind it.
const PITCH = 0.95;

// Where the home page's HTML labels sit on the desk.
const ANCHORS: Record<string, { wide: Spot; narrow: Spot }> = {
  "/periksa": { wide: [-0.6, 0.18], narrow: [-0.5, 0.1] },
  "/latihan": { wide: [-0.2, -0.05], narrow: [0.5, -0.3] },
  "/simulasi": { wide: [0.2, -0.14], narrow: [-0.5, -0.33] },
  "/amankan": { wide: [0, 0.4], narrow: [0.5, 0.1] },
  "/bertindak": { wide: [0.66, 0.29], narrow: [0, 0.47] },
};

// Where a page lies on its thing. `face` is the rectangle the page covers: +y towards the page's top, +z out of it.
// `sheet` is the part that stretches along `axis` to take the page's shape on this screen: its length (y or z), or,
// for something that must stay inside a frame, its width (x).
// `open` poses the thing from shut (0) to open (1) as you pick it up. It never moves the face, so the page lands
// where the camera aimed, and by halfway it has wiped what is drawn under the face, so the page never fades in over it.
type Face = { sheet: THREE.Object3D; axis: "x" | "y" | "z"; face: THREE.Object3D; open?: (o: number) => void };

type Palette = ReturnType<typeof palette>;

// A repeatable random sequence, so the drawn city, its stars, the dust and the globe's land are the same every visit.
const seeded = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// The study's own colours: richer than the app's paper and ink, which stay for the pages. Kept here rather than as
// CSS tokens because they colour only this scene. A sunny study by day; the same room at night in the dark theme.
const ROOM = {
  day: { wall: "#f6eedf", panel: "#a9c1b5", trim: "#8a5a3b", wood: "#c48b5a", pad: "#2f4b55", floor: "#d6bfa0", cork: "#c9a273", accent: "#d9714a", sea: "#4f9db0" },
  night: { wall: "#1d2230", panel: "#2a3646", trim: "#5c3d28", wood: "#6b4429", pad: "#1b2f35", floor: "#241c18", cork: "#8c6a45", accent: "#c8643e", sea: "#2b5866" },
};

// The view out of the window: rooftops on a warm afternoon with clouds drifting over, or the same rooftops at night
// with their windows lit and the stars twinkling, in the dark theme. Seeded, so the city is the same every visit;
// `t` (seconds) moves the sky, and redrawing into the same canvas animates it.
function drawView(c: Palette, cv = Object.assign(document.createElement("canvas"), { width: 320, height: 240 }), t = 0) {
  const g = cv.getContext("2d")!;
  const css = (col: THREE.Color) => `#${col.getHexString()}`;
  const night = c.paper.getHSL({ h: 0, s: 0, l: 0 }).l < 0.5;
  const sky = g.createLinearGradient(0, 0, 0, 240);
  sky.addColorStop(0, css(night ? c.paper : c.card.clone().lerp(c.hl, 0.4)));
  sky.addColorStop(1, css(night ? c.paper.clone().lerp(c.good, 0.3) : c.card.clone().lerp(c.warn, 0.22)));
  g.fillStyle = sky;
  g.fillRect(0, 0, 320, 240);
  g.fillStyle = css(night ? c.ink : c.hl);
  g.beginPath();
  g.arc(236, 64, night ? 16 : 24, 0, Math.PI * 2);
  g.fill();
  const skyRnd = seeded(3);
  if (night) {
    g.fillStyle = css(c.ink);
    for (let i = 0; i < 34; i++) {
      const [x, y, rate] = [skyRnd() * 320, skyRnd() * 120, 1 + skyRnd() * 2];
      g.globalAlpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * rate + i));
      g.fillRect(x, y, 2, 2);
    }
  } else {
    g.fillStyle = css(c.card);
    g.globalAlpha = 0.9;
    for (const [y, speed, k, start] of [[42, 5, 1, 20], [80, 8, 0.75, 190], [24, 3.5, 0.6, 280]] as const) {
      const x = ((start + t * speed) % 420) - 60;
      g.beginPath();
      g.arc(x, y, 12 * k, 0, Math.PI * 2);
      g.arc(x + 15 * k, y - 7 * k, 15 * k, 0, Math.PI * 2);
      g.arc(x + 31 * k, y, 12 * k, 0, Math.PI * 2);
      g.rect(x, y - 2 * k, 31 * k, 14 * k);
      g.fill();
    }
    // A little flock crossing, wings beating.
    g.strokeStyle = css(c.ink);
    g.lineWidth = 1.5;
    g.globalAlpha = 0.7;
    for (const [y, start] of [[66, 0], [57, 22], [73, 38]] as const) {
      const x = ((start + t * 14) % 520) - 100;
      const flap = 3 * Math.sin(t * 7 + start);
      g.beginPath();
      g.moveTo(x - 5, y - flap);
      g.quadraticCurveTo(x - 2, y - 3, x, y);
      g.quadraticCurveTo(x + 2, y - 3, x + 5, y - flap);
      g.stroke();
    }
  }
  // Now and then at night, a shooting star.
  const shoot = ((t % 11) - 5) / 0.8;
  if (night && shoot >= 0 && shoot < 1) {
    const [x, y] = [70 + 130 * shoot, 18 + 45 * shoot];
    g.globalAlpha = 1 - shoot;
    g.strokeStyle = css(c.ink);
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x - 26, y - 9);
    g.stroke();
  }
  g.globalAlpha = 1;
  const rnd = seeded(11);
  for (const [top, depth] of [[120, 0.16], [160, 0.3]] as const) {
    for (let x = -12; x < 330; ) {
      const w = 26 + rnd() * 38;
      const y = top + rnd() * 45;
      g.fillStyle = css(c.paper.clone().lerp(c.ink, night ? depth * 0.55 : depth));
      g.fillRect(x, y, w, 240 - y);
      for (let wy = y + 8; wy < 232; wy += 13) {
        for (let wx = x + 6; wx < x + w - 8; wx += 11) {
          if (night ? rnd() < 0.35 : rnd() < 0.5) {
            g.fillStyle = night ? css(c.hl) : css(c.paper.clone().lerp(c.ink, depth + 0.12));
            g.fillRect(wx, wy, 5, 6);
          }
        }
      }
      x += w + 3;
    }
  }
  return cv;
}

function palette() {
  const css = getComputedStyle(document.documentElement);
  const get = (name: string) => new THREE.Color(css.getPropertyValue(name).trim());
  return {
    paper: get("--paper"),
    card: get("--card"),
    ink: get("--ink"),
    line: get("--line"),
    hl: get("--hl"),
    good: get("--good"),
    warn: get("--warn"),
    danger: get("--danger"),
  };
}

export function startWorld(canvas: HTMLCanvasElement, sheet: () => HTMLElement | null, first: Route, onOpen: (href: string) => void) {
  const c = palette();
  const renderer = new THREE.WebGLRenderer({ canvas }); // the ink pass smooths its own edges
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const night = c.paper.getHSL({ h: 0, s: 0, l: 0 }).l < 0.5;
  const rc = Object.fromEntries(Object.entries(night ? ROOM.night : ROOM.day).map(([k, v]) => [k, new THREE.Color(v)])) as Record<keyof typeof ROOM.day, THREE.Color>;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  const scene = new THREE.Scene();
  scene.background = c.paper;
  // Three divides surface colour by pi, so about pi of light in total lands on the app's own palette, on every side
  // the sun reaches. Two flat tones, as a cel is painted: the sides turned away from it a shade darker.
  scene.add(new THREE.AmbientLight(0xffffff, 2.4));
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(1, 3, 2);
  scene.add(sun);
  const bands = new THREE.DataTexture(new Uint8Array([0, 255]), 2, 1, THREE.RedFormat);
  bands.needsUpdate = true;
  const ink = inkPass(renderer, c.line);
  // Every solid thing gets the two tones and the ink's bold outline.
  const inked = (root: THREE.Object3D) =>
    root.traverse((o) => {
      if (!(o instanceof THREE.Mesh && o.material instanceof THREE.MeshToonMaterial)) return;
      o.material.gradientMap = bands;
      o.layers.enable(INK);
    });

  const edges = new THREE.LineBasicMaterial({ color: c.line });
  const part = (parent: THREE.Object3D, geo: THREE.BufferGeometry, color: THREE.Color, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ color }));
    mesh.position.set(x, y, z);
    const line = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 50), edges);
    line.raycast = () => {}; // outlines must not widen what counts as a click on the object
    mesh.add(line);
    parent.add(mesh);
    return mesh;
  };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const cyl = (r: number, h: number) => new THREE.CylinderGeometry(r, r, h, 18);
  const group = (parent: THREE.Object3D) => {
    const g = new THREE.Group();
    parent.add(g);
    return g;
  };
  // The app's hard offset shadow, as under its buttons: a dark patch on the desk, down and right of a thing lying on it.
  const shadow = (parent: THREE.Object3D, w: number, d: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(0.012, 0.0046, 0.012); // just above the desk pad
    parent.add(m);
  };
  // A flat thing with rounded corners: w by h, t thick, centred like a box. Lying on the desk unless upright.
  const slab = (w: number, h: number, t: number, r: number, upright = false) => {
    const s = new THREE.Shape()
      .moveTo(-w / 2 + r, -h / 2)
      .lineTo(w / 2 - r, -h / 2)
      .quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r)
      .lineTo(w / 2, h / 2 - r)
      .quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2)
      .lineTo(-w / 2 + r, h / 2)
      .quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r)
      .lineTo(-w / 2, -h / 2 + r)
      .quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 5 });
    g.translate(0, 0, -t / 2);
    if (!upright) g.rotateX(-Math.PI / 2);
    return g;
  };
  const faceOn = (parent: THREE.Object3D, w: number, h: number, x: number, y: number, z: number, flat: boolean) => {
    const f = new THREE.Object3D();
    f.position.set(x, y, z);
    if (flat) f.rotation.x = -Math.PI / 2; // lying on the desk, its top edge away from you
    f.scale.set(w, h, 1);
    parent.add(f);
    return f;
  };

  // Round things have no edges to draw; the ink finds their outline.
  const blob = (parent: THREE.Object3D, color: THREE.Color, [x, y, z]: number[], [sx, sy, sz]: number[], tilt = 0, turn = 0) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshToonMaterial({ color }));
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    m.rotation.set(0, turn, tilt);
    parent.add(m);
    return m;
  };
  // A soft patch of colour lying on a surface: the lamp's light on the desk.
  const glow = (parent: THREE.Object3D, color: THREE.Color, r: number, x: number, z: number, strength: number) => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 128;
    const g = cv.getContext("2d")!;
    const fade = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    fade.addColorStop(0, `rgb(255 255 255 / ${strength})`);
    fade.addColorStop(1, "rgb(255 255 255 / 0)");
    g.fillStyle = fade;
    g.fillRect(0, 0, 128, 128);
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(r * 2, r * 2),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), color, transparent: true, depthWrite: false }),
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.0048, z);
    parent.add(m);
  };

  // The fixed part of the world: the desk you sit at and the corner of a study around it. Desk top is y = 0.
  // Nothing hangs high on the left of the wall: the home page's heading sits over that part.
  const room = new THREE.Group();
  scene.add(room);
  const tone = (a: THREE.Color, b: THREE.Color, t: number) => a.clone().lerp(b, t);
  const deskTop = part(room, box(3.6, 0.06, 1.3), rc.wood, 0, -0.03, -0.1); // stands in until the real desks load
  part(room, box(8, 4, 0.05), rc.wall, 0, 1.2, -1.05);
  // A darker panel low on the wall. Phones see the wall only behind the home page's text, so there it stays plain.
  const lowWall: THREE.Object3D[] = [part(room, box(8, 0.19, 0.02), rc.panel, 0, 0.085, -1.02), part(room, box(8, 0.02, 0.03), rc.trim, 0, 0.18, -1.015)];
  part(room, box(8, 0.05, 6), rc.floor, 0, -0.75, 0);
  part(room, box(1.75, 0.004, 1.05), rc.pad, 0, 0.002, -0.025); // a deep blotter to the desk's front, so paper and the yellow folder stand out on it

  // The window, four panes on a sill, with a view drawn in the theme's own colours.
  const viewCanvas = drawView(c);
  const view = new THREE.CanvasTexture(viewCanvas);
  view.colorSpace = THREE.SRGBColorSpace;
  part(room, box(0.58, 0.44, 0.02), rc.trim, 0.55, 0.41, -1.01);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.38), new THREE.MeshBasicMaterial({ map: view }));
  glass.position.set(0.55, 0.41, -0.998); // three's position is read-only: set it, never assign it
  room.add(glass);
  part(room, box(0.012, 0.38, 0.012), rc.trim, 0.55, 0.41, -0.993);
  part(room, box(0.52, 0.012, 0.012), rc.trim, 0.55, 0.43, -0.993);
  part(room, box(0.66, 0.022, 0.07), rc.trim, 0.55, 0.19, -0.995);

  // The lamp's warm pool of light (the phone stands in it), small enough to stay on the wood, off the desk pad.
  glow(room, c.hl, 0.3, -1.02, -0.45, 0.5);

  // Furniture from Kenney's Furniture Kit (CC0, public/models/kenney), drawn like everything else here:
  // toon-shaded with ink outlines, and dimmed to the room's night in the dark theme. Each is scaled to a height
  // (or stretched to a footprint) and stood on its spot. If one fails to load, the room just goes without it.
  const loader = new GLTFLoader();
  let stopped = false;
  type Fit = { turn?: number; footprint?: [w: number, d: number]; mirror?: boolean; wideOnly?: boolean };
  const furnish = (name: string, height: number, [x, y, z]: number[], { turn = 0, footprint, mirror, wideOnly }: Fit = {}) =>
    loader
      .loadAsync(`/models/kenney/${name}.glb`)
      .then(({ scene: m }) => {
        if (stopped) return;
        m.traverse((o) => {
          if (!(o instanceof THREE.Mesh)) return;
          const { name: kind, color: raw } = o.material as THREE.MeshStandardMaterial;
          // The kit's wood takes the room's own; its other colours are meant as sRGB, though glTF reads them as linear.
          const own = kind === "wood" ? rc.wood : kind === "woodDark" ? rc.trim : undefined;
          const color = own ? own.clone() : new THREE.Color().setRGB(raw.r, raw.g, raw.b, THREE.SRGBColorSpace);
          if (night && !own) color.lerp(rc.wall, 0.35).multiplyScalar(0.75);
          o.material = new THREE.MeshToonMaterial({ color });
          const line = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 40), edges);
          line.raycast = () => {};
          o.add(line);
        });
        inked(m);
        m.rotation.y = turn;
        const size = new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3());
        const k = height / size.y;
        m.scale.set(footprint ? footprint[0] / size.x : k, k, footprint ? footprint[1] / size.z : k);
        if (mirror) m.scale.x *= -1;
        const fit = new THREE.Box3().setFromObject(m);
        m.position.set(x - (fit.min.x + fit.max.x) / 2, y - fit.min.y, z - (fit.min.z + fit.max.z) / 2);
        room.add(m);
        if (wideOnly) {
          lowWall.push(m); // on a phone it would stand right behind the home page's text, or over its labels
          m.visible = !narrow;
        }
        if (name === "desk") deskTop.visible = false;
        dirty = true;
        return m;
      })
      .catch(() => undefined);

  // Two desks pushed together make the long one, drawers at either end: one stretched desk looks bloated.
  furnish("desk", 0.75, [-0.9, -0.75, -0.1], { footprint: [1.8, 1.3] });
  furnish("desk", 0.75, [0.9, -0.75, -0.1], { footprint: [1.8, 1.3], mirror: true });
  furnish("lampRoundTable", 0.44, [-1.2, 0, -0.66], { turn: 0.5 });
  furnish("plantSmall2", 0.17, [-0.22, 0, -0.68], { wideOnly: true });
  furnish("books", 0.17, [0.42, 0, -0.68], { turn: -0.15, wideOnly: true });
  furnish("radio", 0.19, [1.05, 0, -0.68], { turn: -0.25 });


  // A bookcase on the floor behind the right end of the desk, beside the window: only its upper shelves show
  // above the desk. Squeezed shallow to fit between desk and wall. Its shelves are found by looking down through
  // it, so whatever stands on them sits on the boards whatever their height.
  furnish("bookcaseOpen", 1.6, [1.42, -0.75, -0.89], { footprint: [0.72, 0.26], wideOnly: true }).then((shelf) => {
    if (!shelf) return;
    shelf.updateMatrixWorld(true); // just placed: the ray must see it where it now stands
    const down = new THREE.Raycaster(new THREE.Vector3(1.42, 3, -0.89), new THREE.Vector3(0, -1, 0));
    const boards = down
      .intersectObject(shelf, true)
      .map((h) => h.point.y)
      .filter((y) => y > 0.05); // only the shelves that show above the desk
    const [top, ...lower] = boards;
    if (top !== undefined) furnish("plantSmall3", 0.2, [1.28, top, -0.89], { wideOnly: true });
    if (top !== undefined) furnish("cardboardBoxOpen", 0.09, [1.56, top, -0.9], { turn: -0.3, wideOnly: true });
    for (const y of lower) {
      furnish("books", 0.16, [1.3, y, -0.9], { wideOnly: true });
      furnish("plantSmall1", 0.16, [1.58, y, -0.9], { wideOnly: true });
    }
  });

  // A clock on the wall, stopped at 09.41 like the tablet's own status bar.
  const clock = group(room);
  clock.position.set(0.98, 0.48, -1.02); // between the window and the bookcase, clear of the home heading
  lowWall.push(clock);
  part(clock, cyl(0.09, 0.015), c.card, 0, 0, 0).rotation.x = Math.PI / 2;
  part(clock, new THREE.TorusGeometry(0.09, 0.012, 8, 32), rc.trim, 0, 0, 0.004);
  for (const [len, turns, w] of [[0.05, (9 + 41 / 60) / 12, 0.012], [0.072, 41 / 60, 0.008]] as const) {
    const hand = group(clock);
    hand.rotation.z = -turns * Math.PI * 2;
    part(hand, box(w, len, 0.004), c.ink, 0, len / 2, 0.012);
  }
  blob(clock, c.danger, [0, 0, 0.016], [0.008, 0.008, 0.004]);

  // Light and life, all of it behind the home page's text on a phone: the window's light falling across the desk
  // with dust turning in it, string lights on the wall, candles, and a globe that slowly turns.
  const ambient = group(room);
  lowWall.push(ambient);
  const soft = (() => {
    const cv = Object.assign(document.createElement("canvas"), { width: 64, height: 64 });
    const g = cv.getContext("2d")!;
    const fade = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    fade.addColorStop(0, "rgb(255 255 255 / 1)");
    fade.addColorStop(0.35, "rgb(255 255 255 / 0.45)");
    fade.addColorStop(1, "rgb(255 255 255 / 0)");
    g.fillStyle = fade;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(cv);
  })();
  const halo = (parent: THREE.Object3D, color: THREE.Color, size: number, opacity: number, [x, y, z]: number[]) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(size);
    s.position.set(x, y, z);
    parent.add(s);
    return s;
  };

  // Shafts of light: sheets hanging from the top of the window down towards the desk, fading as they fall,
  // soft at their sides. Warm sun by day, a faint cool moonlight at night.
  const shaft = (() => {
    const cv = Object.assign(document.createElement("canvas"), { width: 64, height: 128 });
    const g = cv.getContext("2d")!;
    const along = g.createLinearGradient(0, 0, 0, 128);
    along.addColorStop(0, "rgb(255 255 255 / 1)");
    along.addColorStop(1, "rgb(255 255 255 / 0)");
    g.fillStyle = along;
    g.fillRect(0, 0, 64, 128);
    g.globalCompositeOperation = "destination-in";
    const across = g.createLinearGradient(0, 0, 64, 0);
    for (const [at, a] of [[0, 0], [0.3, 1], [0.7, 1], [1, 0]]) across.addColorStop(at, `rgb(0 0 0 / ${a})`);
    g.fillStyle = across;
    g.fillRect(0, 0, 64, 128);
    return new THREE.CanvasTexture(cv);
  })();
  const fall = new THREE.Vector3(-0.32, -0.62, 0.72).normalize();
  for (const [x0, x1, len] of [[0.31, 0.53, 1.05], [0.57, 0.8, 0.95]] as const) {
    const a = new THREE.Vector3(x0, 0.6, -0.99);
    const b = new THREE.Vector3(x1, 0.6, -0.99);
    const sheet = new THREE.BufferGeometry().setFromPoints([a, b, b.clone().addScaledVector(fall, len), a.clone().addScaledVector(fall, len)]);
    sheet.setIndex([0, 1, 2, 0, 2, 3]);
    sheet.setAttribute("uv", new THREE.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2));
    const light = new THREE.MeshBasicMaterial({ map: shaft, color: night ? c.ink : c.hl, transparent: true, opacity: night ? 0.07 : 0.32, depthWrite: false, side: THREE.DoubleSide });
    if (night) light.blending = THREE.AdditiveBlending;
    ambient.add(new THREE.Mesh(sheet, light));
  }
  // Dust turning slowly in the light.
  const dustRnd = seeded(5);
  const motes = new Float32Array(60 * 3);
  for (let i = 0; i < 60; i++) {
    const p = new THREE.Vector3(0.32 + dustRnd() * 0.46, 0.6, -0.99).addScaledVector(fall, 0.12 + dustRnd() * 0.8);
    motes.set([p.x, p.y + (dustRnd() - 0.5) * 0.06, p.z], i * 3);
  }
  const dust = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(motes.slice(), 3));
  ambient.add(new THREE.Points(dust, new THREE.PointsMaterial({ map: soft, color: night ? c.ink : c.card, size: 0.018, transparent: true, opacity: night ? 0.35 : 0.95, depthWrite: false })));

  // String lights swung from the pinboard to the window: unlit by day, glowing at night.
  const drape = (t: number) => new THREE.Vector3(-0.3 + 0.57 * t, 0.36 + 0.11 * t - 0.07 * Math.sin(Math.PI * t), -1.0);
  ambient.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 21 }, (_, i) => drape(i / 20))), new THREE.LineBasicMaterial({ color: c.line })));
  const bulbs: THREE.Sprite[] = [];
  for (let i = 1; i < 10; i++) {
    const p = drape(i / 10);
    blob(ambient, night ? c.hl : tone(c.hl, c.card, 0.55), [p.x, p.y - 0.014, p.z + 0.01], [0.01, 0.013, 0.01]);
    if (night) bulbs.push(halo(ambient, c.hl, 0.09, 0.6, [p.x, p.y - 0.014, p.z + 0.02]));
  }

  // A pair of candles on a saucer, lit only at night.
  const candles = group(ambient);
  candles.position.set(-0.52, 0, -0.66);
  part(candles, cyl(0.06, 0.008), rc.trim, 0, 0.004, 0);
  const flames: THREE.Object3D[] = [];
  const glows: THREE.Sprite[] = [];
  for (const [x, z, h] of [[-0.018, 0.006, 0.13], [0.026, -0.012, 0.085]] as const) {
    part(candles, cyl(0.018, h), tone(c.card, c.warn, 0.12), x, 0.008 + h / 2, z);
    part(candles, cyl(0.002, 0.012), c.ink, x, 0.014 + h, z);
    if (night) {
      flames.push(blob(candles, c.hl, [x, 0.03 + h, z], [0.007, 0.016, 0.007]));
      glows.push(halo(candles, tone(c.warn, c.hl, 0.5), 0.16, 0.55, [x, 0.032 + h, z]));
    }
  }

  // A globe on its stand, turning slowly: blue seas, land in the app's green.
  const globe = group(ambient);
  globe.position.set(-0.02, 0, -0.68);
  part(globe, cyl(0.045, 0.012), rc.trim, 0, 0.006, 0);
  part(globe, cyl(0.006, 0.05), rc.trim, 0, 0.035, 0);
  const axis = group(globe);
  axis.position.y = 0.135;
  axis.rotation.z = 0.41; // the earth's own tilt
  part(axis, new THREE.TorusGeometry(0.088, 0.005, 6, 40), rc.trim, 0, 0, 0).rotation.y = 1.15; // seen edge-on enough to read as a meridian
  const map = (() => {
    const cv = Object.assign(document.createElement("canvas"), { width: 128, height: 64 });
    const g = cv.getContext("2d")!;
    g.fillStyle = `#${rc.sea.getHexString()}`;
    g.fillRect(0, 0, 128, 64);
    g.fillStyle = `#${tone(c.good, c.card, 0.25).getHexString()}`;
    const landRnd = seeded(9);
    for (let i = 0; i < 9; i++) {
      g.beginPath();
      g.ellipse(landRnd() * 128, 10 + landRnd() * 44, 6 + landRnd() * 14, 4 + landRnd() * 9, landRnd() * 3, 0, Math.PI * 2);
      g.fill();
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();
  const earth = new THREE.Mesh(new THREE.SphereGeometry(0.075, 28, 18), new THREE.MeshToonMaterial({ map }));
  axis.add(earth);

  // A celengan ayam in the window's light: the clay hen a family drops its coins into, the savings all of this is
  // here to protect. Painted with flowers, a coin slot in her back, looking out at you.
  const hen = group(ambient);
  hen.position.set(0.74, 0, -0.6);
  hen.rotation.y = -0.6;
  const clay = tone(rc.accent, c.danger, 0.3);
  blob(hen, clay, [0, 0.05, 0], [0.055, 0.045, 0.042]);
  blob(hen, clay, [0.045, 0.098, 0], [0.026, 0.03, 0.024]);
  blob(hen, clay, [-0.052, 0.082, 0], [0.018, 0.036, 0.032], 0.5);
  blob(hen, c.danger, [0.046, 0.13, 0], [0.016, 0.012, 0.007]);
  blob(hen, c.hl, [0.072, 0.096, 0], [0.012, 0.006, 0.007]);
  for (const side of [1, -1]) blob(hen, c.line, [0.06, 0.106, 0.017 * side], [0.004, 0.004, 0.004]);
  blob(hen, c.hl, [0.004, 0.056, 0.039], [0.013, 0.013, 0.004]);
  blob(hen, tone(c.good, c.card, 0.2), [-0.024, 0.04, 0.034], [0.009, 0.009, 0.004]);
  blob(hen, tone(c.good, c.card, 0.2), [0.026, 0.036, 0.035], [0.008, 0.008, 0.004]);
  part(hen, box(0.03, 0.006, 0.006), c.line, -0.004, 0.094, 0);

  // Steam curling up off the mug the way a cartoon draws it: three wavy strokes, each rising and fading in its turn.
  const wisp = (() => {
    const cv = Object.assign(document.createElement("canvas"), { width: 32, height: 96 });
    const g = cv.getContext("2d")!;
    g.strokeStyle = "#fff";
    g.lineWidth = 6;
    g.lineCap = "round";
    g.beginPath();
    for (let y = 6; y <= 90; y += 2) g.lineTo(16 + 9 * Math.sin(y / 14), y);
    g.stroke();
    return new THREE.CanvasTexture(cv);
  })();
  const steam = [0, 1, 2].map(() => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: wisp, color: c.line, transparent: true, depthWrite: false }));
    s.scale.set(0.028, 0.08, 1);
    ambient.add(s);
    return s;
  });
  const rise = (t: number) =>
    steam.forEach((s, i) => {
      const k = (t * 0.35 + i / 3) % 1;
      s.position.set(1.05 + (i - 1) * 0.025, 0.16 + k * 0.07, -0.5);
      s.material.opacity = 0.85 * Math.sin(Math.PI * k);
    });
  rise(0);

  let skyShown = -1;
  // One beat of the room's life, at time t seconds: dust drifts, lights twinkle, flames flicker, the globe turns,
  // the mug steams, the sky moves on (redrawn ten times a second: plenty for clouds).
  const stir = (t: number) => {
    const at = dust.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < 60; i++) {
      at.setXYZ(i, motes[i * 3] + Math.sin(t * 0.4 + i) * 0.025, motes[i * 3 + 1] + Math.sin(t * 0.3 + i * 2.1) * 0.025, motes[i * 3 + 2] + Math.cos(t * 0.35 + i) * 0.025);
    }
    at.needsUpdate = true;
    bulbs.forEach((b, i) => (b.material.opacity = 0.45 + 0.25 * Math.sin(t * 1.7 + i * 1.3)));
    flames.forEach((f, i) => (f.scale.y = 0.016 * (1 + 0.15 * Math.sin(t * 13 + i * 2) + 0.08 * Math.sin(t * 7.3 + i))));
    glows.forEach((g, i) => (g.material.opacity = 0.5 + 0.12 * Math.sin(t * 11 + i * 3)));
    earth.rotation.y = t * 0.25;
    rise(t);
    if (t - skyShown >= 0.1) {
      skyShown = t;
      drawView(c, viewCanvas, t);
      view.needsUpdate = true;
    }
  };

  // Always there, whatever page is open: a mug with a handle, and a cup of pencils.
  part(room, cyl(0.05, 0.11), rc.accent, 1.05, 0.055, -0.5);
  part(room, new THREE.TorusGeometry(0.028, 0.009, 8, 18), rc.accent, 1.1, 0.06, -0.5);
  part(room, cyl(0.042, 0.1), tone(c.card, c.ink, 0.15), 1.3, 0.05, -0.34);
  for (const [color, tx, tz] of [[c.hl, 0.12, 0.05], [c.danger, -0.1, 0.08], [c.good, 0.04, -0.12]] as const) {
    const pencil = part(room, cyl(0.007, 0.16), color, 1.3 + tx * 0.12, 0.13, -0.34 + tz * 0.12);
    pencil.rotation.set(tz, 0, -tx);
  }

  const models: Record<string, (g: THREE.Group) => Face> = {
    printout(g) {
      const sheet = group(g);
      shadow(sheet, 0.26, 0.34);
      part(sheet, box(0.26, 0.006, 0.34), c.card, 0, 0.005, 0);
      const marks = [
        part(sheet, box(0.18, 0.003, 0.025), c.hl, -0.01, 0.01, -0.09),
        part(sheet, box(0.2, 0.003, 0.012), c.line, 0, 0.01, -0.03),
        part(sheet, box(0.14, 0.003, 0.012), c.line, -0.03, 0.01, 0.01),
      ];
      // Beside the paper, not on it: the page would cover it. Opening, it sweeps once over the sheet, then off to the side.
      const glass = group(g);
      part(glass, cyl(0.056, 0.004), tone(c.card, c.good, 0.25), 0, 0.009, 0);
      const rim = part(glass, new THREE.TorusGeometry(0.058, 0.009, 8, 32), c.ink, 0, 0.011, 0);
      rim.rotation.x = -Math.PI / 2;
      // A curved glint, so the disc reads as glass. Unlit and left out of the ink pass, or its outline would swallow it.
      const glint = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.004, 6, 12, 1.1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      glint.rotation.set(-Math.PI / 2, 0, 1.9);
      glint.position.y = 0.012;
      glass.add(glint);
      // Neck and grip run straight out from the rim's centre, towards the lower right.
      part(glass, cyl(0.006, 0.02), c.ink, 0.0436, 0.009, 0.0573).rotation.set(Math.PI / 2, 0, -0.65);
      part(glass, cyl(0.012, 0.08), c.hl, 0.0726, 0.012, 0.0955).rotation.set(Math.PI / 2, 0, -0.65);
      const open = (o: number) => {
        const over = Math.sin(Math.PI * o);
        glass.position.set(0.215 - 0.285 * over + 0.1 * o, 0.03 * over, 0.04 - 0.08 * over + 0.04 * o);
        glass.rotation.y = 0.5 * o;
        for (const m of marks) m.visible = o < 0.5;
      };
      open(0);
      return { sheet, axis: "z", face: faceOn(sheet, 0.26, 0.34, 0, 0.008, 0, true), open };
    },
    cards(g) {
      const sheet = group(g);
      const green = c.card.clone().lerp(c.good, 0.3); // the page lying on it is the same sage, a little paler
      shadow(sheet, 0.2, 0.28);
      // The top card is centred on the stretch, so stretching never slides the page off it. On the way, the cards
      // under it fan out, as when a deck is spread to deal, and gather back under it before you read.
      const cards = [0, 1, 2, 3].map((i) => part(sheet, slab(0.2, 0.28, 0.012, 0.018), i === 3 ? green : c.card, 0, 0.008 + i * 0.013, (i - 3) * 0.002));
      const fan = [
        [-0.07, -0.32],
        [-0.04, -0.17],
        [0.05, 0.2],
      ];
      const open = (o: number) => fan.forEach(([x, turn], i) => {
        const spread = Math.sin(Math.PI * o);
        cards[i].position.x = x * spread;
        cards[i].rotation.y = turn * spread;
      });
      return { sheet, axis: "z", face: faceOn(sheet, 0.18, 0.26, 0, 0.053, 0, true), open };
    },
    // A tablet in portrait, 3:4, leaning back on a folding stand: thin even bezels and a camera dot at the top.
    tablet(g) {
      const body = group(g);
      body.rotation.x = -0.3;
      body.position.y = 0.185;
      part(body, slab(0.28, 0.37, 0.012, 0.024, true), c.ink, 0, 0, 0);
      // Asleep on the desk, its lock screen dark under three notifications; it wakes as you pick it up.
      const screen = part(body, slab(0.255, 0.34, 0.003, 0.012, true), c.card, 0, 0, 0.0075);
      const awake = c.card.clone();
      const asleep = c.card.clone().lerp(new THREE.Color(0x000000), 0.75);
      part(body, cyl(0.004, 0.002), c.line, 0, 0.1755, 0.0065).rotation.x = Math.PI / 2; // the camera dot
      const marks = [
        part(body, box(0.13, 0.03, 0.002), c.paper, -0.045, 0.1, 0.0095),
        part(body, box(0.13, 0.03, 0.002), c.hl, 0.045, 0.05, 0.0095),
        part(body, box(0.15, 0.03, 0.002), c.card.clone().lerp(c.warn, 0.5), -0.035, 0, 0.0095),
      ];
      // The stand: a lip it rests in at the front, and a leg folded out behind.
      part(g, slab(0.3, 0.07, 0.016, 0.014), c.ink, 0, 0.008, -0.01);
      const leg = part(g, slab(0.16, 0.26, 0.008, 0.012, true), c.ink, 0, 0.12, -0.1);
      leg.rotation.x = 0.42;
      const open = (o: number) => {
        (screen.material as THREE.MeshToonMaterial).color.lerpColors(asleep, awake, o);
        for (const m of marks) m.visible = o < 0.5;
      };
      open(0);
      return { sheet: body, axis: "y", face: faceOn(body, 0.255, 0.34, 0, 0, 0.009, false), open };
    },
    // A clipboard: a checklist under a metal clip, two of its boxes already ticked. The clip sits above the paper,
    // so the open page, which covers the paper, never hides it; opening, its lever flips up off the board.
    clipboard(g) {
      const sheet = group(g);
      shadow(sheet, 0.24, 0.34);
      part(sheet, slab(0.24, 0.34, 0.012, 0.02), rc.trim, 0, 0.007, 0);
      part(sheet, box(0.2, 0.004, 0.28), c.card, 0, 0.015, 0);
      const marks = [0, 1, 2].flatMap((i) => [
        part(sheet, box(0.024, 0.003, 0.024), i < 2 ? tone(c.card, c.good, 0.8) : c.card, -0.06, 0.018, -0.06 + i * 0.065),
        part(sheet, box(0.09, 0.003, 0.01), c.line, 0.025, 0.018, -0.06 + i * 0.065),
      ]);
      const lever = group(sheet);
      lever.position.set(0, 0.016, -0.17); // hinged on the board's top edge
      part(lever, slab(0.1, 0.03, 0.016, 0.008), tone(c.card, c.ink, 0.45), 0, 0.008, 0.015);
      const open = (o: number) => {
        lever.rotation.x = -1.1 * o;
        for (const m of marks) m.visible = o < 0.5;
      };
      return { sheet, axis: "z", face: faceOn(sheet, 0.2, 0.28, 0, 0.018, 0, true), open };
    },
    // Yellow is kept for someone in a hurry: on the desk, this is the one bright thing. Opening, its labelled cover
    // swings over on the left-hand fold and lies flat on the desk, showing the sheet inside, which the page lies on.
    folder(g) {
      const sheet = group(g);
      shadow(sheet, 0.34, 0.42);
      part(sheet, slab(0.34, 0.42, 0.008, 0.016), c.hl, 0, 0.006, 0);
      part(sheet, slab(0.12, 0.05, 0.008, 0.012), c.hl, -0.1, 0.006, -0.215);
      part(sheet, box(0.3, 0.003, 0.38), c.card, 0, 0.0115, 0);
      const cover = group(sheet);
      cover.position.set(-0.17, 0.014, 0);
      part(cover, slab(0.34, 0.42, 0.006, 0.016), c.hl, 0.17, 0.003, 0);
      part(cover, box(0.26, 0.004, 0.02), c.ink, 0.17, 0.008, -0.1);
      const open = (o: number) => (cover.rotation.z = Math.PI * o);
      return { sheet, axis: "z", face: faceOn(sheet, 0.3, 0.38, 0, 0.013, 0, true), open };
    },
    // A pinboard leaning on the wall at the back of the desk: notes, red pins and the red string between them,
    // the way you would piece a scam together. Each note is a tip, scrawled in the app's red-pen hand. Pinned in the
    // middle, the map of how scams are built, folded in three: opening, its outer panels swing out flat either side,
    // and it widens to the page's shape, never taller than the cork, so the page lies on the board, not over it.
    pinboard(g) {
      const board = group(g);
      board.rotation.x = -0.08;
      part(board, box(0.6, 0.32, 0.025), rc.trim, 0, 0.16, 0);
      part(board, box(0.56, 0.28, 0.01), rc.cork, 0, 0.16, 0.014);
      const pins: THREE.Vector3[] = [];
      const hand = getComputedStyle(document.documentElement).getPropertyValue("--font-kalam").trim() || "cursive";
      for (const [x, y, w, color, spin, tip] of [
        [-0.215, 0.22, 0.1, c.card, 0.06, "OTP itu\nrahasia!"],
        [-0.21, 0.09, 0.09, c.hl, -0.08, "Jangan\nburu-buru"],
        [0.21, 0.21, 0.1, tone(c.card, c.good, 0.35), 0.05, "Cek dulu\nlink-nya"],
        [0.215, 0.09, 0.08, tone(c.card, c.danger, 0.3), -0.1, "Bank tak\nminta PIN"],
      ] as const) {
        const note = part(board, box(w, w * 0.9, 0.003), color, x, y, 0.021);
        note.rotation.z = spin;
        const cv = Object.assign(document.createElement("canvas"), { width: 128, height: 116 });
        const words = new THREE.CanvasTexture(cv);
        words.colorSpace = THREE.SRGBColorSpace;
        const written = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.92, w * 0.83), new THREE.MeshBasicMaterial({ map: words, transparent: true }));
        written.position.set(0, -w * 0.06, 0.002);
        note.add(written);
        // Once the hand has loaded; if it never does, the fallback still writes the tip.
        const write = () => {
          const g = cv.getContext("2d")!;
          g.fillStyle = color === c.hl ? "#17181c" : `#${c.ink.getHexString()}`; // yellow stays yellow in the dark
          g.font = `700 27px ${hand}`;
          g.textAlign = "center";
          tip.split("\n").forEach((line, i) => g.fillText(line, 64, 52 + i * 34));
          words.needsUpdate = dirty = true;
        };
        document.fonts.load(`700 27px ${hand}`).then(write, write);
        const pin = blob(board, c.danger, [x, y + w * 0.38, 0.03], [0.009, 0.009, 0.009]);
        pins.push(pin.position.clone());
      }
      board.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([pins[0], pins[1], pins[2], pins[3]]), new THREE.LineBasicMaterial({ color: c.danger })));

      // The map is the sheet; its middle panel stays put while the outer two swing out.
      const [third, tall] = [0.075, 0.24];
      const map = group(board);
      map.position.set(0, 0.16, 0.026);
      part(map, box(third, tall, 0.002), c.card, 0, 0, 0);
      const [left, right] = [-1, 1].map((side, i) => {
        const hinge = group(map);
        hinge.position.set((side * third) / 2, 0, 0.0025 * (i + 1)); // the last fold lies over the first
        part(hinge, box(third, tall, 0.002), c.card, (side * third) / 2, 0, 0);
        return hinge;
      });
      // Its cover, on the outside of the last fold: a red route down a column of stops, as on the page.
      const cv = Object.assign(document.createElement("canvas"), { width: 64, height: 210 });
      const pen = cv.getContext("2d")!;
      const [inkHex, red] = [`#${c.ink.getHexString()}`, `#${c.danger.getHexString()}`];
      pen.fillStyle = inkHex;
      pen.fillRect(10, 10, 44, 9);
      pen.strokeStyle = red;
      pen.lineWidth = 3;
      pen.setLineDash([6, 5]);
      pen.beginPath();
      pen.moveTo(18, 46);
      pen.lineTo(18, 186);
      pen.stroke();
      pen.setLineDash([]);
      for (const y of [46, 116, 186]) {
        pen.beginPath();
        pen.arc(18, y, 7, 0, Math.PI * 2);
        pen.fillStyle = `#${c.card.getHexString()}`;
        pen.fill();
        pen.stroke();
        pen.fillStyle = inkHex;
        pen.fillRect(32, y - 3, 22, 5);
      }
      const art = new THREE.CanvasTexture(cv);
      art.colorSpace = THREE.SRGBColorSpace;
      const cover = new THREE.Mesh(new THREE.PlaneGeometry(third * 0.9, tall * 0.92), new THREE.MeshBasicMaterial({ map: art, transparent: true }));
      cover.rotation.y = Math.PI; // out of the panel's back, which faces you once it is folded over
      cover.position.set(third / 2, 0, -0.0012);
      right.add(cover);
      const pin = blob(map, c.danger, [0, tall / 2 - 0.016, 0.012], [0.009, 0.009, 0.009]);
      const open = (o: number) => {
        left.rotation.y = Math.PI * (1 - o);
        right.rotation.y = -Math.PI * (1 - o);
        pin.visible = o < 0.5;
      };
      open(0);
      return { sheet: map, axis: "x", face: faceOn(map, third * 3, tall, 0, 0, 0.008, false), open };
    },
  };

  const things = THINGS.map((t) => {
    const g = new THREE.Group();
    g.userData.href = t.href;
    scene.add(g);
    return { ...t, g, ...models[t.model](g), kFrom: 1, kTo: 1, o: 0, oFrom: 0, oTo: 0 };
  });
  const clickable = things.map((t) => t.g);
  // A page with no thing of its own (not found) lies on the printout; so does the map on a phone, which has no wall.
  const thingFor = (r: Route) =>
    r === "home" ? undefined : things.find((t) => t.href === `/${r === "lain" || (r === "peta" && narrow) ? "periksa" : r}`);

  const desk = buildPhone(c.line, getComputedStyle(document.body).fontFamily);
  scene.add(desk.phone);
  desk.pose(2); // lit with its first message, which is where it stays when motion is reduced
  let idle = 0;
  let idleShown = -1;

  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 20);

  let route = first;
  let narrow = false;
  let dirty = true;
  let mx = 0;
  let my = 0;
  let lookX = 0;
  let lookY = 0;
  let hover: string | null = null;
  let spread = 1;
  let headFoot = 0.3; // how far down a phone's screen the home heading ends, as last measured
  let rect = { left: 0, top: 0, width: 1, height: 1 };
  let flyT = 1;
  let shown = "";
  const eye = new THREE.Vector3();
  const lookHome = new THREE.Quaternion();
  const from = { pos: new THREE.Vector3(), quat: new THREE.Quaternion() };
  const to = { pos: new THREE.Vector3(), quat: new THREE.Quaternion() };
  const spin = new THREE.Euler(0, 0, 0, "YXZ");
  const turn = new THREE.Quaternion();
  const tilt = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const focus = new THREE.Vector3(); // the middle of the open page
  const v = new THREE.Vector3();
  const r = new THREE.Vector3();
  const u = new THREE.Vector3();
  const n = new THREE.Vector3();
  const mtx = new THREE.Matrix4();
  const pxToFace = new THREE.Matrix4();
  const toScreen = new THREE.Matrix4();

  // A spot's x on the desk. On phones its first number is a place across the screen: the x seen there from your chair.
  const across = ([x, z]: readonly number[]) =>
    narrow ? x * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect * (Math.sin(PITCH) * eye.y - Math.cos(PITCH) * (z - eye.z)) : x * spread;

  // Things where they lie on the desk, the one under the pointer lifted a little.
  const layout = () => {
    for (const t of things) {
      const spot = narrow ? t.narrow : t.wide;
      t.g.visible = !!spot;
      if (!spot) continue;
      t.g.position.set(t.narrow ? across(spot) : spot[0], hover === t.href ? 0.015 : 0, spot[1]); // the wall stays put
      t.g.scale.setScalar(narrow ? 0.62 : 1); // a phone has room for far less desk
    }
    const spot = narrow ? PHONE.narrow : PHONE.wide;
    const x = across(spot);
    desk.phone.position.set(x, 0.002, spot[1]); // just above the desk, so its outline underneath does not cut into it
    desk.phone.rotation.y = Math.atan2(eye.x - x, eye.z - spot[1]); // its screen always faces you
    desk.phone.scale.setScalar(narrow ? 1 : 1.45);
    for (const o of lowWall) o.visible = !narrow;
    dirty = true;
  };

  // Swing a camera pose round the open page, keeping the page's middle where it is on screen.
  const orbit = (pos: THREE.Vector3, quat: THREE.Quaternion, yaw: number, pitch: number, side: THREE.Vector3) => {
    turn.setFromAxisAngle(up, yaw).multiply(tilt.setFromAxisAngle(side, pitch));
    pos.sub(focus).applyQuaternion(turn).add(focus);
    quat.premultiply(turn);
  };

  // Where the camera ends up: in your chair for home; otherwise over the open page's thing, close enough that the
  // middle of the page shows at its own size (text at its normal size), then leaned so it reads as a thing on the desk.
  const aim = () => {
    const open = thingFor(route);
    for (const t of things) {
      t.kTo = 1;
      t.oTo = t === open ? 1 : 0;
    }
    if (!open) {
      to.pos.copy(eye);
      to.quat.copy(lookHome);
      return;
    }
    const k = (rect.height / rect.width) * (open.face.scale.x / open.face.scale.y);
    open.kTo = open.axis === "x" ? 1 / k : k;
    // Measured as it will lie once stretched: a wider face is seen from further back.
    const now = open.sheet.scale[open.axis];
    open.sheet.scale[open.axis] = open.kTo;
    scene.updateMatrixWorld(true);
    const f = open.face.matrixWorld;
    const p = planeFromRect(rect, canvas.clientWidth, canvas.clientHeight, camera.fov, 1);
    const d = r.setFromMatrixColumn(f, 0).length() / p.w;
    r.normalize();
    u.setFromMatrixColumn(f, 1).normalize();
    n.setFromMatrixColumn(f, 2).normalize();
    to.pos.setFromMatrixPosition(f).addScaledVector(n, d).addScaledVector(r, -p.x * d).addScaledVector(u, -p.y * d);
    to.quat.setFromRotationMatrix(mtx.makeBasis(r, u, n));
    focus.setFromMatrixPosition(f);
    open.sheet.scale[open.axis] = now;
    // A phone's or a standing tablet's screen has little room to lean into: turned sideways, the page's near edge
    // runs off the screen and every line slants.
    const upright = narrow || canvas.clientHeight > canvas.clientWidth;
    orbit(to.pos, to.quat, upright ? 0 : open.lean[1], open.lean[0] * (narrow ? 0.35 : 1), r);
  };

  const place = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    narrow = w < 768;
    renderer.setSize(w, h, false);
    ink.setSize();
    camera.aspect = w / h;
    camera.fov = narrow ? 50 : 45;
    camera.updateProjectionMatrix();
    spread = narrow ? 1 : Math.min(1, camera.aspect / 1.6); // squarer windows pull things in from the edges
    // Seated: eye above the desk, looking down at it, back enough on wide screens to see the study round the desk.
    if (narrow) {
      // A phone's desk fills the screen under the heading, whatever the phone. Looking down at PITCH, two points fix
      // where the eye is: the tablet's top just under the heading, and the front label clear of the screen's foot.
      const head = route === "home" ? document.querySelector("#isi > p") : null; // home's intro, under its heading
      if (head) headFoot = (head.getBoundingClientRect().bottom + 16) / h;
      const tan = Math.tan((camera.fov * Math.PI) / 360);
      const [sn, cs] = [Math.sin(PITCH), Math.cos(PITCH)];
      // The eye sees height y at depth z `px` down the screen anywhere on this line: a·eye.y + b·eye.z = c.
      const line = (y: number, z: number, px: number) => {
        const s = (1 - (2 * px) / h) * tan;
        const [a, b] = [cs + s * sn, s * cs - sn];
        return [a, b, a * y + b * z];
      };
      const tablet = THINGS.find((t) => t.model === "tablet")!;
      const [a1, b1, c1] = line(TABLET_TOP, tablet.narrow![1] - 0.03, headFoot * h);
      const [a2, b2, c2] = line(0, ANCHORS["/bertindak"].narrow[1], h - 76);
      const det = a1 * b2 - a2 * b1;
      eye.set(0, (c1 * b2 - c2 * b1) / det, (a1 * c2 - a2 * c1) / det);
      camera.position.copy(eye);
      camera.rotation.set(-PITCH, 0, 0);
    } else {
      eye.set(0, 0.72, 1.3);
      camera.position.copy(eye);
      camera.lookAt(0, 0.02, -0.33);
    }
    lookHome.copy(camera.quaternion);
    rect = pageRect(route, w, h);
    layout();
    aim();
    const el = sheet();
    if (el && route !== "home") {
      el.style.width = `${rect.width}px`;
      el.style.height = `${rect.height}px`;
      el.style.setProperty("--page-h", `${rect.height}px`); // lets the tablet's chat fill its screen
      shown = "";
    }
  };
  const size = new ResizeObserver(place);
  size.observe(canvas);

  // The page's real HTML laid onto its thing: page pixels to the thing's face, to the screen, as one CSS matrix.
  const pageOn = (face: THREE.Object3D) => {
    const { clientWidth: w, clientHeight: h } = canvas;
    pxToFace.set(1 / rect.width, 0, 0, -0.5, 0, -1 / rect.height, 0, 0.5, 0, 0, 1, 0, 0, 0, 0, 1);
    toScreen.set(w / 2, 0, 0, w / 2, 0, -h / 2, 0, h / 2, 0, 0, 1, 0, 0, 0, 0, 1);
    mtx.multiplyMatrices(toScreen, camera.projectionMatrix).multiply(camera.matrixWorldInverse).multiply(face.matrixWorld).multiply(pxToFace);
    return `matrix3d(${mtx.elements.join(",")})`;
  };

  const draw = () => {
    dirty = false;
    const e = easeOut(flyT);
    camera.position.lerpVectors(from.pos, to.pos, e);
    camera.quaternion.slerpQuaternions(from.quat, to.quat, e);
    if (route === "home") {
      // Looking around from the chair: a few degrees at most, and only with a mouse.
      camera.position.x += lookX * 0.02 * e;
      camera.quaternion.multiply(turn.setFromEuler(spin.set(-lookY * 0.012 * e, -lookX * 0.025 * e, 0)));
    } else {
      // Leaning round the page you are reading, a little, as the mouse moves over the desk.
      orbit(camera.position, camera.quaternion, lookX * 0.035 * e, -lookY * 0.02 * e, v.set(1, 0, 0).applyQuaternion(camera.quaternion));
    }
    // Things open over most of the flight, eased in and out; the page fades onto its thing once it is open.
    const s = Math.min(1, flyT / 0.75);
    const opening = s * s * (3 - 2 * s);
    for (const t of things) {
      t.sheet.scale[t.axis] = t.kFrom + (t.kTo - t.kFrom) * e;
      t.o = t.oFrom + (t.oTo - t.oFrom) * opening;
      t.open?.(t.o);
    }
    camera.updateMatrixWorld(true);
    scene.updateMatrixWorld();
    ink.render(scene, camera);

    const open = thingFor(route);
    const el = sheet();
    if (open && el) {
      const next = pageOn(open.face);
      if (next !== shown) el.style.transform = shown = next;
      // The page lies over its thing, so it waits for the thing to open, then fades on.
      el.style.opacity = flyT < 1 ? String(Math.min(1, Math.max(0, (flyT - 0.55) / 0.35))) : "";
    }

    // Pin the home page's HTML labels to the things they name.
    if (route === "home") {
      const { clientWidth: w, clientHeight: h } = canvas;
      const labels = [...document.querySelectorAll<HTMLElement>("[data-anchor]")];
      const halves = labels.map((el) => el.offsetWidth / 2 + 8); // all read before any write: one layout, not five
      labels.forEach((el, i) => {
        const a = ANCHORS[el.dataset.anchor!];
        if (!a) return;
        const spot = narrow ? a.narrow : a.wide;
        v.set(across(spot), 0, spot[1]).project(camera);
        // Kept whole on screen, however near the edge its thing lies.
        el.style.setProperty("--x", `${Math.min(w - halves[i], Math.max(halves[i], ((v.x + 1) / 2) * w))}px`);
        el.style.setProperty("--y", `${((1 - v.y) / 2) * h}px`);
      });
    }
  };

  // While reading, the other things say what they open when you point at them; at the desk, so does the pinboard.
  const tip = Object.assign(document.createElement("p"), { className: "meja-tip", hidden: true });
  tip.setAttribute("aria-hidden", "true"); // the same choices are real links on the home page
  document.body.append(tip);

  const ray = new THREE.Raycaster();
  const propAt = (e: PointerEvent) => {
    const b = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1), camera);
    // Hidden things still catch rays: only what is shown can be clicked.
    let o: THREE.Object3D | null = ray.intersectObjects(clickable.filter((g) => g.visible), true)[0]?.object ?? null;
    while (o && !o.userData.href) o = o.parent;
    const href = (o?.userData.href as string | undefined) ?? null;
    return href === thingFor(route)?.href ? null : href; // the page you are reading is already open
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    // Over the page, hold still: what you are about to click must not slide away under the pointer.
    if (route === "home" || !sheet()?.contains(e.target as Node)) {
      mx = (e.clientX / innerWidth) * 2 - 1;
      my = (e.clientY / innerHeight) * 2 - 1;
    }
    const onCanvas = e.target === canvas;
    const label = (e.target as Element).closest?.("[data-anchor]")?.getAttribute("data-anchor") ?? null;
    const next = label ?? (onCanvas ? propAt(e) : null);
    if (onCanvas) canvas.style.cursor = next ? "pointer" : "";
    // On the desk the home page's labels already say it; the wall has none.
    const name = next && (route !== "home" || !ANCHORS[next]) ? THINGS.find((t) => t.href === next)?.name : undefined;
    tip.hidden = !name;
    if (name) {
      tip.textContent = name;
      tip.style.translate = `${e.clientX + 16}px ${e.clientY + 18}px`;
    }
    if (next !== hover) {
      hover = next;
      layout();
    }
  };
  const onClick = (e: MouseEvent) => {
    const href = propAt(e as PointerEvent);
    if (href) onOpen(href);
  };
  // Scrolling with the pointer on the desk around the page scrolls the page, as anywhere on a web page.
  const onWheel = (e: WheelEvent) => {
    if (route === "home" || sheet()?.contains(e.target as Node)) return;
    const page = sheet()?.querySelector("main");
    if (!page) return;
    const px = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * page.clientHeight : e.deltaY;
    page.scrollBy({ top: px, behavior: Math.abs(px) >= 50 ? "smooth" : "instant" }); // a wheel notch glides, a trackpad follows
  };
  // Esc puts the page down, as backing out of something in a game. Not while typing: there Esc belongs to the field.
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || route === "home" || e.defaultPrevented) return;
    if ((e.target as Element).closest?.("input, textarea, select, [contenteditable]")) return;
    onOpen("/");
  };
  addEventListener("pointermove", onMove);
  addEventListener("wheel", onWheel, { passive: true });
  addEventListener("keydown", onKey);
  canvas.addEventListener("click", onClick);

  inked(scene);
  place();
  let last = performance.now();
  let raf = requestAnimationFrame(function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.max(0, Math.min((now - last) / 1000, 0.1)); // the first frame can be stamped before the start
    last = now;
    if (flyT < 1) {
      flyT = Math.min(1, flyT + dt / FLY);
      dirty = true;
    }
    const tx = reduced.matches ? 0 : mx;
    const ty = reduced.matches ? 0 : my;
    if (Math.abs(tx - lookX) + Math.abs(ty - lookY) > 0.001) {
      const k = Math.min(1, dt * 4);
      lookX += (tx - lookX) * k;
      lookY += (ty - lookY) * k;
      dirty = true;
    }
    // The phone and the room's small motions keep the desk redrawing, so cap them at 30 fps. On a phone the page
    // being read covers the desk, so it holds still there: the GPU stays free for scrolling.
    if (!reduced.matches && (route === "home" || !narrow)) {
      idle += dt;
      if (idle - idleShown >= 1 / 30) {
        idleShown = idle;
        desk.pose(idle);
        stir(idle);
        dirty = true;
      }
    }
    if (dirty) draw();
  });

  return {
    go(next: Route) {
      route = next;
      hover = null;
      canvas.style.cursor = "";
      tip.hidden = true;
      from.pos.copy(camera.position);
      from.quat.copy(camera.quaternion);
      for (const t of things) {
        t.kFrom = t.sheet.scale[t.axis];
        t.oFrom = t.o;
      }
      flyT = reduced.matches ? 1 : 0;
      if (route === "home") sheet()?.removeAttribute("style");
      place();
      draw(); // before the browser paints the new page, so it never shows unplaced
      // Keys scroll the page at once, and a screen reader starts on the new page.
      if (route !== "home") sheet()?.querySelector("main")?.focus({ preventScroll: true });
    },
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
      size.disconnect();
      removeEventListener("pointermove", onMove);
      removeEventListener("wheel", onWheel);
      removeEventListener("keydown", onKey);
      canvas.removeEventListener("click", onClick);
      tip.remove();
      sheet()?.removeAttribute("style");
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) {
          o.geometry.dispose(); // shared geometries and materials are safe to dispose twice
          for (const m of [o.material].flat()) m.dispose();
        }
      });
      ink.dispose();
      renderer.dispose();
    },
  };
}
