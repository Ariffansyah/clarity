import * as THREE from "three";
import { phonePose } from "@/lib/desk";

const BODY = "#17181c"; // a phone is dark in both themes
const STAND = "#3a3d45";

// The fictional messages from the app's own examples, arriving one after another.
const MESSAGES = [
  ["+62 812-xxxx-0077", "Nasabah Yth, akun m-banking Anda", "akan diblokir dalam 24 jam. Segera…"],
  ["HRD Rekrutmen Online", "Kerja dari rumah, gaji Rp150.000", "per tugas. Gabung grup Telegram…"],
  ["Kurir KirimCepat", "Paket kakak tertahan di gudang.", "Cek fotonya di Foto_Paket.apk"],
];

// A phone propped on a little stand, facing you. Every few seconds it buzzes with a new message from a scammer, the
// kind Clarity is for. About 0.2 tall, standing on y = 0, facing +z. `font` is the page's own font family.
export function buildPhone(line: THREE.Color, font: string) {
  const phone = new THREE.Group();
  const edges = new THREE.LineBasicMaterial({ color: line });
  const solid = (parent: THREE.Object3D, geo: THREE.BufferGeometry, color: THREE.ColorRepresentation, [x, y, z]: number[]) => {
    const m = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ color }));
    m.position.set(x, y, z);
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 50), edges));
    parent.add(m);
    return m;
  };

  solid(phone, new THREE.BoxGeometry(0.1, 0.012, 0.07), STAND, [0, 0.006, 0]);
  solid(phone, new THREE.BoxGeometry(0.1, 0.02, 0.01), STAND, [0, 0.016, 0.03]);

  // The phone itself, leaning back on the stand. It is what shakes when a message buzzes in.
  const lean = new THREE.Group();
  lean.position.set(0, 0.012, 0.022);
  lean.rotation.x = -0.28;
  phone.add(lean);
  const r = 0.012;
  const [w, h] = [0.085, 0.175];
  const outline = new THREE.Shape()
    .moveTo(-w / 2 + r, 0)
    .lineTo(w / 2 - r, 0)
    .quadraticCurveTo(w / 2, 0, w / 2, r)
    .lineTo(w / 2, h - r)
    .quadraticCurveTo(w / 2, h, w / 2 - r, h)
    .lineTo(-w / 2 + r, h)
    .quadraticCurveTo(-w / 2, h, -w / 2, h - r)
    .lineTo(-w / 2, r)
    .quadraticCurveTo(-w / 2, 0, -w / 2 + r, 0);
  const body = new THREE.ExtrudeGeometry(outline, { depth: 0.009, bevelEnabled: false, curveSegments: 5 });
  body.translate(0, 0, -0.0045);
  solid(lean, body, BODY, [0, 0, 0]);

  // The lock screen: a dusky wallpaper and the time, the same 09.41 as everywhere else in the app.
  const wall = Object.assign(document.createElement("canvas"), { width: 160, height: 340 });
  const g = wall.getContext("2d")!;
  const dusk = g.createLinearGradient(0, 0, 0, 340);
  dusk.addColorStop(0, "#3b4a63");
  dusk.addColorStop(1, "#151820");
  g.fillStyle = dusk;
  g.fillRect(0, 0, 160, 340);
  g.fillStyle = "#f0ece2";
  g.textAlign = "center";
  g.font = `800 44px ${font}`;
  g.fillText("09.41", 80, 78);
  g.font = `600 13px ${font}`;
  g.fillText("Minggu, 1 November", 80, 100);
  const wallpaper = new THREE.CanvasTexture(wall);
  wallpaper.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.077, 0.165), new THREE.MeshBasicMaterial({ map: wallpaper }));
  screen.position.set(0, h / 2, 0.0047);
  lean.add(screen);

  // The notification, drawn again whenever a new message arrives.
  const card = Object.assign(document.createElement("canvas"), { width: 300, height: 170 });
  const n = card.getContext("2d")!;
  const notice = new THREE.CanvasTexture(card);
  notice.colorSpace = THREE.SRGBColorSpace;
  const write = ([from, ...body]: string[]) => {
    n.clearRect(0, 0, 300, 170);
    n.fillStyle = "#fbf9f3";
    n.beginPath();
    n.roundRect(0, 0, 300, 170, 26);
    n.fill();
    n.fillStyle = "#1e6b4e";
    n.beginPath();
    n.roundRect(18, 16, 34, 34, 9);
    n.fill();
    n.fillStyle = "#fbf9f3";
    n.beginPath();
    n.arc(35, 33, 9, 0, Math.PI * 2);
    n.fill();
    n.fillStyle = "#55585f";
    n.font = `600 17px ${font}`;
    n.fillText("Pesan · baru saja", 64, 39);
    n.fillStyle = "#17181c";
    n.font = `800 21px ${font}`;
    n.fillText(from, 18, 88);
    n.font = `500 18px ${font}`;
    body.forEach((text, i) => n.fillText(text, 18, 118 + i * 26));
    notice.needsUpdate = true;
  };
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(0.071, 0.04), new THREE.MeshBasicMaterial({ map: notice, transparent: true }));
  lean.add(banner);

  let shown = -1;
  return {
    phone,
    pose(t: number) {
      const p = phonePose(t);
      if (p.message !== shown) write(MESSAGES[(shown = p.message) % MESSAGES.length]);
      lean.rotation.z = p.buzz;
      lean.position.x = p.buzz * 0.08;
      (screen.material as THREE.MeshBasicMaterial).color.setScalar(0.18 + 0.82 * p.lit);
      (banner.material as THREE.MeshBasicMaterial).opacity = p.lit;
      banner.position.set(0, h - 0.045 + 0.012 * (1 - p.drop), 0.0052);
    },
  };
}
