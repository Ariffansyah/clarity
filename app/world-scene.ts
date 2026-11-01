import * as THREE from "three";
import { easeOut, planeFromRect, type Route } from "@/lib/desk";

const SWITCH = 0.55; // seconds for one desk's things to leave and the next ones to arrive
const FRAME_DIST = 1;
const FRAME_PAD = 10; // px of frame showing around the page

type Spot = [x: number, z: number];
type Prop = { model: string; wide: Spot; narrow: Spot; href?: string };

// What lies on the desk for each page. `narrow` keeps things in the strip a phone shows above the page.
const DESKS: Record<Route, Prop[]> = {
  home: [
    { model: "printout", href: "/periksa", wide: [-0.6, -0.15], narrow: [-0.17, -0.42] },
    { model: "cards", href: "/latihan", wide: [-0.2, -0.35], narrow: [0.17, -0.42] },
    { model: "phone", href: "/simulasi", wide: [0.2, -0.35], narrow: [-0.15, 0.2] },
    { model: "folder", href: "/bertindak", wide: [0.6, -0.15], narrow: [0.15, 0.2] },
  ],
  periksa: [
    { model: "paperStack", wide: [-0.86, -0.2], narrow: [-0.26, -0.58] },
    { model: "magnifier", wide: [0.86, -0.2], narrow: [0.26, -0.58] },
  ],
  latihan: [
    { model: "cards", wide: [-0.86, -0.2], narrow: [-0.26, -0.58] },
    { model: "redCards", wide: [0.86, -0.2], narrow: [0.26, -0.58] },
  ],
  simulasi: [
    { model: "phone", wide: [-0.86, -0.3], narrow: [-0.26, -0.58] },
    { model: "chatNotes", wide: [0.86, -0.2], narrow: [0.26, -0.58] },
  ],
  bertindak: [
    { model: "folder", wide: [-0.86, -0.2], narrow: [-0.26, -0.58] },
    { model: "pen", wide: [0.86, -0.2], narrow: [0.26, -0.58] },
  ],
  lain: [],
};

// Where the home page's HTML labels and Sorot stand on the desk.
const ANCHORS: Record<string, { wide: Spot; narrow: Spot }> = {
  "/periksa": { wide: [-0.6, 0.06], narrow: [-0.17, -0.25] },
  "/latihan": { wide: [-0.2, -0.17], narrow: [0.17, -0.25] },
  "/simulasi": { wide: [0.2, -0.26], narrow: [-0.13, 0.38] },
  "/bertindak": { wide: [0.6, 0.1], narrow: [0.13, 0.38] },
  sorot: { wide: [-0.95, -0.42], narrow: [0, 0.1] },
};

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
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const wood = c.card.clone().lerp(c.warn, 0.22);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  const scene = new THREE.Scene();
  scene.background = c.paper;
  // Three divides surface colour by pi, so about pi of light in total lands on the app's own palette.
  scene.add(new THREE.AmbientLight(0xffffff, 2.8));
  const sun = new THREE.DirectionalLight(0xffffff, 0.5);
  sun.position.set(1, 3, 2);
  scene.add(sun);

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

  // The fixed part of the world: the desk you sit at, and the wall in front of you. Desk top is y = 0.
  const room = new THREE.Group();
  scene.add(room);
  part(room, box(3.6, 0.06, 1.3), wood, 0, -0.03, -0.1);
  part(room, box(8, 4, 0.05), c.card, 0, 1.2, -1.05);
  part(room, box(8, 0.05, 6), c.paper, 0, -0.75, 0);
  // A desk mat, a window, and the lamp and mug that are always there, whatever page you are on.
  part(room, box(1.75, 0.004, 0.8), c.paper, 0, 0.002, -0.15);
  part(room, box(0.56, 0.42, 0.02), c.ink, 0.98, 0.33, -1.01);
  part(room, box(0.5, 0.36, 0.02), c.paper.clone().lerp(c.good, 0.18), 0.98, 0.33, -1);
  part(room, box(0.012, 0.36, 0.02), c.ink, 0.98, 0.33, -0.99);
  part(room, cyl(0.08, 0.02), c.ink, -1.22, 0.01, -0.6);
  part(room, cyl(0.012, 0.34), c.ink, -1.22, 0.17, -0.6);
  part(room, new THREE.ConeGeometry(0.11, 0.11, 18), c.ink, -1.22, 0.36, -0.6);
  part(room, cyl(0.05, 0.11), c.warn, 1.05, 0.055, -0.5);

  const models: Record<string, (g: THREE.Group) => void> = {
    printout(g) {
      part(g, box(0.26, 0.006, 0.34), c.card, 0, 0.005, 0);
      part(g, box(0.18, 0.003, 0.025), c.hl, -0.01, 0.01, -0.09);
      part(g, box(0.2, 0.003, 0.012), c.line, 0, 0.01, -0.03);
      part(g, box(0.14, 0.003, 0.012), c.line, -0.03, 0.01, 0.01);
      const lens = part(g, new THREE.TorusGeometry(0.06, 0.012, 8, 24), c.ink, 0.07, 0.02, 0.06);
      lens.rotation.x = -Math.PI / 2;
      const handle = part(g, cyl(0.01, 0.1), c.ink, 0.13, 0.02, 0.14);
      handle.rotation.set(Math.PI / 2, 0, 0.65);
    },
    paperStack(g) {
      for (let i = 0; i < 5; i++) part(g, box(0.26, 0.012, 0.34), c.card, (i % 2) * 0.006, 0.008 + i * 0.012, (i % 3) * 0.004);
      part(g, box(0.18, 0.003, 0.025), c.hl, 0, 0.07, -0.08);
    },
    magnifier(g) {
      const lens = part(g, new THREE.TorusGeometry(0.1, 0.018, 8, 28), c.ink, 0, 0.17, 0);
      lens.rotation.y = -0.4;
      part(g, cyl(0.014, 0.1), c.ink, 0, 0.05, 0);
      part(g, cyl(0.06, 0.012), c.ink, 0, 0.006, 0);
    },
    cards(g) {
      const green = c.card.clone().lerp(c.good, 0.55);
      for (let i = 0; i < 4; i++) part(g, box(0.2, 0.012, 0.28), i === 3 ? green : c.card, 0, 0.008 + i * 0.013, i * 0.002);
    },
    redCards(g) {
      const red = c.card.clone().lerp(c.danger, 0.55);
      for (let i = 0; i < 4; i++) part(g, box(0.2, 0.012, 0.28), i === 3 ? red : c.card, 0, 0.008 + i * 0.013, i * 0.002);
    },
    phone(g) {
      const body = new THREE.Group();
      body.rotation.x = -0.32;
      body.position.y = 0.17;
      g.add(body);
      part(body, box(0.17, 0.33, 0.016), c.ink, 0, 0, 0);
      part(body, box(0.15, 0.3, 0.004), c.card, 0, 0, 0.01);
      part(body, box(0.09, 0.03, 0.002), c.paper, -0.022, 0.09, 0.013);
      part(body, box(0.09, 0.03, 0.002), c.hl, 0.022, 0.04, 0.013);
      part(body, box(0.1, 0.03, 0.002), c.card.clone().lerp(c.warn, 0.5), -0.015, -0.01, 0.013);
      part(g, box(0.17, 0.02, 0.1), c.ink, 0, 0.01, -0.04);
    },
    chatNotes(g) {
      part(g, box(0.18, 0.006, 0.18), c.hl, -0.03, 0.004, -0.02).rotation.y = 0.2;
      part(g, box(0.18, 0.006, 0.18), c.card.clone().lerp(c.warn, 0.5), 0.04, 0.01, 0.06).rotation.y = -0.15;
    },
    // Yellow is kept for someone in a hurry: on the home desk, this is the one bright thing.
    folder(g) {
      part(g, box(0.34, 0.02, 0.42), c.hl, 0, 0.012, 0);
      part(g, box(0.12, 0.022, 0.04), c.hl, -0.1, 0.012, -0.22);
      part(g, box(0.26, 0.004, 0.02), c.ink, 0, 0.025, -0.1);
    },
    pen(g) {
      const pen = part(g, cyl(0.016, 0.3), c.hl, 0, 0.02, 0);
      pen.rotation.set(Math.PI / 2, 0, 0.7);
      part(g, box(0.22, 0.006, 0.3), c.card, 0.02, 0.004, 0.02).rotation.y = 0.15;
      part(g, box(0.14, 0.003, 0.012), c.line, 0.02, 0.009, -0.06);
      part(g, box(0.14, 0.003, 0.012), c.line, 0.02, 0.009, -0.02);
    },
  };

  const stages = (Object.keys(DESKS) as Route[]).map((route) => {
    const group = new THREE.Group();
    scene.add(group);
    const props = DESKS[route].map((p) => {
      const g = new THREE.Group();
      models[p.model](g);
      g.userData.href = p.href;
      group.add(g);
      return { ...p, g };
    });
    return { route, group, props, t: route === first ? 1 : 0 };
  });
  const clickable = stages.find((s) => s.route === "home")!.props.map((p) => p.g);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 20);
  scene.add(camera);

  // The frame behind a page. It hangs off the camera, so it always lines up with the HTML page on top
  // of it while the desk shifts underneath as you look around. It draws last so props never poke through.
  const frame = new THREE.Group();
  camera.add(frame);
  const flat = (color: THREE.Color) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color, depthTest: false, toneMapped: false }));
    m.renderOrder = 10;
    frame.add(m);
    return m;
  };
  const shadow = flat(c.hl);
  const border = flat(c.ink);
  const clip = flat(c.ink);
  const FRAMES: Record<Route, { color: THREE.Color; clip: boolean }> = {
    home: { color: c.ink, clip: false },
    periksa: { color: c.card, clip: true },
    latihan: { color: c.card.clone().lerp(c.good, 0.55), clip: false },
    simulasi: { color: c.ink, clip: false },
    bertindak: { color: c.hl, clip: true },
    lain: { color: c.card, clip: false },
  };

  let route = first;
  let frameT = first === "home" ? 0 : 1;
  let narrow = false;
  let dirty = true;
  let mx = 0;
  let my = 0;
  let lookX = 0;
  let lookY = 0;
  let hover: string | null = null;
  let spread = 1;
  const lookHome = new THREE.Quaternion();
  const lookPage = new THREE.Quaternion();
  const eye = new THREE.Vector3();
  const spin = new THREE.Euler(0, 0, 0, "YXZ");
  const v = new THREE.Vector3();

  const place = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    narrow = w < 768;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = narrow ? 50 : 45;
    camera.updateProjectionMatrix();
    spread = narrow ? 1 : Math.min(1, camera.aspect / 1.6); // squarer windows pull things in from the edges
    // Seated: eye above the desk, looking down at it. On a phone you bow your head further once a page is
    // open, which lifts the desk's far edge into the strip above the sheet.
    eye.set(0, narrow ? 0.95 : 0.66, narrow ? 1.2 : 1.1);
    camera.position.copy(eye);
    camera.lookAt(0, narrow ? -0.16 : 0.03, -0.35);
    lookHome.copy(camera.quaternion);
    camera.lookAt(0, narrow ? -0.55 : 0.03, narrow ? -0.3 : -0.35);
    lookPage.copy(camera.quaternion);

    const r = sheet()?.getBoundingClientRect();
    if (r) {
      const p = planeFromRect(r, w, h, camera.fov, FRAME_DIST);
      const pad = FRAME_PAD * p.unit;
      border.scale.set(p.w + pad * 2, p.h + pad * 2, 1);
      border.position.set(p.x, p.y, -FRAME_DIST);
      shadow.scale.copy(border.scale);
      shadow.position.set(p.x + pad * 1.2, p.y - pad * 1.2, -FRAME_DIST - 0.001);
      clip.scale.set(p.w * 0.22, pad * 3, 1);
      clip.position.set(p.x, p.y + p.h / 2 + pad * 0.6, -FRAME_DIST + 0.001);
      frame.userData.drop = p.h + 40 * p.unit;
    }
    dirty = true;
  };
  const size = new ResizeObserver(place);
  size.observe(canvas);
  const watched = sheet();
  if (watched) size.observe(watched);

  const paint = (mat: THREE.Material, color: THREE.Color) => (mat as THREE.MeshBasicMaterial).color.copy(color);
  const styleFrame = () => {
    paint(border.material, FRAMES[route].color);
    clip.visible = FRAMES[route].clip;
  };
  styleFrame();

  const ray = new THREE.Raycaster();
  const propAt = (e: PointerEvent) => {
    if (route !== "home") return null;
    const r = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    let o: THREE.Object3D | null = ray.intersectObjects(clickable, true)[0]?.object ?? null;
    while (o && !o.userData.href) o = o.parent;
    return (o?.userData.href as string | undefined) ?? null;
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    mx = (e.clientX / innerWidth) * 2 - 1;
    my = (e.clientY / innerHeight) * 2 - 1;
    const onCanvas = e.target === canvas;
    const label = (e.target as Element).closest?.("[data-anchor]")?.getAttribute("data-anchor") ?? null;
    const next = label ?? (onCanvas ? propAt(e) : null);
    if (onCanvas) canvas.style.cursor = next ? "pointer" : "";
    if (next !== hover) {
      hover = next;
      dirty = true;
    }
  };
  const onClick = (e: MouseEvent) => {
    const href = propAt(e as PointerEvent);
    if (href) onOpen(href);
  };
  addEventListener("pointermove", onMove);
  canvas.addEventListener("click", onClick);

  let last = performance.now();
  let raf = requestAnimationFrame(function tick(now) {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const step = reduced.matches ? 1 : dt / SWITCH;

    for (const s of stages) {
      const want = s.route === route ? 1 : 0;
      if (s.t !== want) {
        s.t = want > s.t ? Math.min(1, s.t + step) : Math.max(0, s.t - step);
        dirty = true;
      }
    }
    const wantFrame = route === "home" ? 0 : 1;
    if (frameT !== wantFrame) {
      frameT = wantFrame > frameT ? Math.min(1, frameT + step) : Math.max(0, frameT - step);
      dirty = true;
    }

    // Looking around from the chair: a few degrees at most, and only with a mouse.
    const tx = reduced.matches ? 0 : mx;
    const ty = reduced.matches ? 0 : my;
    if (Math.abs(tx - lookX) + Math.abs(ty - lookY) > 0.001) {
      const k = Math.min(1, dt * 4);
      lookX += (tx - lookX) * k;
      lookY += (ty - lookY) * k;
      dirty = true;
    }
    if (!dirty) return;
    dirty = false;

    for (const s of stages) {
      s.group.visible = s.t > 0;
      const e = easeOut(s.t);
      for (const p of s.props) {
        const [x, z] = narrow ? p.narrow : p.wide;
        // Things slide across the desk from its sides, the way you would push them away and pull new ones in.
        p.g.position.set(x * spread + Math.sign(x) * (1 - e) * 2, hover && p.href === hover ? 0.015 : 0, z);
        p.g.scale.setScalar(narrow ? 0.62 : 1); // a phone has room for far less desk
      }
    }
    frame.visible = frameT > 0;
    frame.position.y = -(1 - easeOut(frameT)) * (frame.userData.drop ?? 2);

    camera.position.copy(eye);
    camera.position.x += lookX * 0.02;
    camera.quaternion.slerpQuaternions(lookHome, lookPage, easeOut(frameT));
    camera.quaternion.multiply(new THREE.Quaternion().setFromEuler(spin.set(-lookY * 0.012, -lookX * 0.025, 0)));
    camera.updateMatrixWorld(true);
    renderer.render(scene, camera);

    // Pin the page's HTML labels to the things they name.
    if (route === "home") {
      const { clientWidth: w, clientHeight: h } = canvas;
      document.querySelectorAll<HTMLElement>("[data-anchor]").forEach((el) => {
        const a = ANCHORS[el.dataset.anchor!];
        if (!a) return;
        const [x, z] = narrow ? a.narrow : a.wide;
        v.set(x * spread, 0, z).project(camera);
        el.style.setProperty("--x", `${((v.x + 1) / 2) * w}px`);
        el.style.setProperty("--y", `${((1 - v.y) / 2) * h}px`);
      });
    }
  });

  return {
    go(next: Route) {
      route = next;
      hover = null;
      canvas.style.cursor = "";
      styleFrame();
      place();
      requestAnimationFrame(place); // the new page's box only settles once the swap has painted
    },
    stop() {
      cancelAnimationFrame(raf);
      size.disconnect();
      removeEventListener("pointermove", onMove);
      canvas.removeEventListener("click", onClick);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) {
          o.geometry.dispose();
          for (const m of [o.material].flat()) m.dispose();
        }
      });
      renderer.dispose();
    },
  };
}
