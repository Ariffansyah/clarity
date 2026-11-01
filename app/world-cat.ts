import * as THREE from "three";
import { catPose } from "@/lib/desk";

const OUTLINE = "#17181c"; // dark in both themes, like .btn-main: the cat is yellow either way
const YELLOW = "#ffd84a";
const BELLY = "#fff3c4";
const ORANGE = "#f59e2a";
const STRIPE = "#e0a31f";

// Sorot, a highlighter-yellow kucing oren with a sharp eye for scams. About 0.3 tall, sitting on y = 0, facing +z.
export function buildCat(whisker: THREE.Color) {
  const cat = new THREE.Group();
  const ink = new THREE.MeshBasicMaterial({ color: OUTLINE });
  const hull = new THREE.MeshBasicMaterial({ color: OUTLINE, side: THREE.BackSide });
  const toon = (color: THREE.ColorRepresentation) => new THREE.MeshToonMaterial({ color });
  const ball = new THREE.SphereGeometry(1, 24, 16);

  // A slightly bigger copy turned inside out is what draws the cartoon outline around a round shape.
  const blob = (parent: THREE.Object3D, color: string, [x, y, z]: number[], [sx, sy, sz]: number[], outlined = true) => {
    const m = new THREE.Mesh(ball, toon(color));
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    if (outlined) {
      const edge = new THREE.Mesh(ball, hull);
      edge.scale.setScalar(1 + 0.007 / Math.min(sx, sy, sz));
      m.add(edge);
    }
    parent.add(m);
    return m;
  };
  const tube = (parent: THREE.Object3D, points: number[][]) => {
    const path = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    parent.add(new THREE.Mesh(new THREE.TubeGeometry(path, 16, 0.014, 10), toon(YELLOW)));
    parent.add(new THREE.Mesh(new THREE.TubeGeometry(path, 16, 0.021, 10), hull));
  };
  const spot = (parent: THREE.Object3D, material: THREE.Material, [x, y, z]: number[], [sx, sy, sz]: number[]) => {
    const m = new THREE.Mesh(ball, material);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    parent.add(m);
    return m;
  };

  blob(cat, YELLOW, [0, 0.085, 0], [0.085, 0.09, 0.07]);
  blob(cat, BELLY, [0, 0.08, 0.05], [0.047, 0.055, 0.024], false);
  for (const x of [-0.035, 0.035]) blob(cat, YELLOW, [x, 0.016, 0.06], [0.03, 0.018, 0.034]);

  const tail = new THREE.Group();
  tail.position.set(0.06, 0.04, -0.03);
  tube(tail, [[0, 0, 0], [0.05, 0, -0.005], [0.085, 0.04, -0.01], [0.085, 0.085, -0.01], [0.105, 0.105, -0.01]]);
  blob(tail, YELLOW, [0.105, 0.105, -0.01], [0.015, 0.015, 0.015]); // rounds off the tube's open end
  cat.add(tail);

  const arm = new THREE.Group();
  arm.position.set(-0.07, 0.115, 0.02);
  tube(arm, [[0, 0, 0], [-0.035, 0.012, 0.005], [-0.055, 0.05, 0.01]]);
  blob(arm, YELLOW, [-0.057, 0.062, 0.01], [0.019, 0.019, 0.019]);
  cat.add(arm);

  // The head, drawn after the body so its outline sits in front of the neck.
  const head = new THREE.Group();
  head.position.y = 0.205;
  cat.add(head);
  blob(head, YELLOW, [0, 0, 0], [0.095, 0.075, 0.078]);
  for (const side of [-1, 1]) {
    const earGeo = new THREE.ConeGeometry(0.034, 0.06, 4);
    const ear = new THREE.Mesh(earGeo, toon(YELLOW));
    ear.position.set(side * 0.06, 0.075, 0);
    ear.rotation.z = -side * 0.3;
    const earEdge = new THREE.Mesh(earGeo, hull);
    earEdge.scale.setScalar(1.22);
    ear.add(earEdge);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.038, 4), toon(ORANGE));
    inner.position.set(0, -0.006, 0.014);
    ear.add(inner);
    head.add(ear);
    spot(head, toon(ORANGE), [side * 0.058, -0.022, 0.056], [0.015, 0.009, 0.006]);
    for (const [dy, tilt] of [[0.006, 0.12], [-0.012, -0.08]]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.0016, 0.0016, 0.05, 5), new THREE.MeshBasicMaterial({ color: whisker }));
      w.position.set(side * 0.115, dy, 0.02);
      w.rotation.z = Math.PI / 2 + side * tilt;
      head.add(w);
    }
    const smile = new THREE.Mesh(new THREE.TorusGeometry(0.008, 0.0016, 6, 12, Math.PI), ink);
    smile.position.set(side * 0.008, -0.024, 0.075);
    smile.rotation.x = Math.PI;
    head.add(smile);
  }
  for (const [x, tilt] of [[-0.016, 0.3], [0, 0], [0.016, -0.3]]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.02, 0.004), toon(STRIPE));
    s.position.set(x, 0.056, 0.05);
    s.rotation.set(-0.8, 0, tilt);
    head.add(s);
  }
  spot(head, ink, [0, -0.012, 0.078], [0.006, 0.004, 0.003]);
  const eyes = new THREE.Group();
  head.add(eyes);
  for (const x of [-0.036, 0.036]) {
    spot(eyes, ink, [x, 0.004, 0.07], [0.012, 0.017, 0.006]);
    spot(eyes, new THREE.MeshBasicMaterial({ color: "#ffffff" }), [x + 0.004, 0.011, 0.075], [0.004, 0.004, 0.002]);
  }

  return {
    cat,
    pose(t: number) {
      const p = catPose(t);
      tail.rotation.z = p.tail;
      arm.rotation.z = p.arm;
      eyes.scale.y = p.eyes;
    },
  };
}
