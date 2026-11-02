import * as THREE from "three";

export const INK = 1; // the layer of things that get inked: the solid, toon-shaded ones

// The study drawn like a picture book: rendered once for its colours and once for its shapes, then inked by hand
// where a shape breaks (an outline, a fold), over the grain of the paper it is painted on. The thin lines on the
// models stay for small detail; these are the bold strokes round everything. Only the canvas is drawn this way:
// the pages lying on the desk are real HTML on top, so their text stays crisp.
export function inkPass(renderer: THREE.WebGLRenderer, ink: THREE.Color) {
  // sRGB storage keeps the night's dark tones from banding, and needs no extension anywhere WebGL2 runs.
  const colour = new THREE.WebGLRenderTarget(1, 1, { samples: 4, colorSpace: THREE.SRGBColorSpace });
  // Float depth: the steps it finds are a few millimetres (a sheet on the desk), finer than 16 or 24 bits can tell.
  const shape = new THREE.WebGLRenderTarget(1, 1, { depthTexture: new THREE.DepthTexture(1, 1, THREE.FloatType) });
  const normals = new THREE.MeshNormalMaterial();
  const u = {
    tColour: { value: colour.texture },
    tNormal: { value: shape.texture },
    tDepth: { value: shape.depthTexture },
    ink: { value: ink },
    texel: { value: new THREE.Vector2() }, // one pixel of the drawing buffer, in uv
    dpr: { value: 1 },
    near: { value: 0.1 },
    far: { value: 10 },
  };
  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      uniforms: u,
      depthTest: false,
      depthWrite: false,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: /* glsl */ `
        #include <packing>
        uniform sampler2D tColour, tNormal, tDepth;
        uniform vec3 ink;
        uniform vec2 texel;
        uniform float dpr, near, far;
        varying vec2 vUv;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
        }
        // Nearness, 1 / distance: it changes evenly across any flat surface, so only real steps show as edges.
        float nearness(vec2 uv) { return -1.0 / perspectiveDepthToViewZ(texture2D(tDepth, uv).x, near, far); }
        vec3 facing(vec2 uv) { return texture2D(tNormal, uv).xyz * 2.0 - 1.0; }

        void main() {
          vec2 at = gl_FragCoord.xy / dpr; // in CSS pixels, so it is drawn the same on every screen
          // A steady hand, but a hand: the strokes wander a little off the true edge. The wandering point is put back
          // on a pixel's centre, so its neighbours sit evenly either side: uneven ones would see an edge on any slope.
          vec2 uv = vUv + (vec2(noise(at / 40.0), noise(at / 40.0 + 19.0)) - 0.5) * 2.4 * dpr * texel;
          uv = (floor(uv / texel) + 0.5) * texel;

          // Both measured about 1.6 CSS px out, so the thin sides of things seen nearly edge-on fill in as one stroke.
          float r = max(1.0, floor(1.6 * dpr + 0.5));
          vec2 a = vec2(r * texel.x, 0), b = vec2(0, r * texel.y);
          float w = nearness(uv);
          float jump = (abs(nearness(uv + a) + nearness(uv - a) - 2.0 * w) + abs(nearness(uv + b) + nearness(uv - b) - 2.0 * w)) / w;
          vec3 n = facing(uv);
          float fold = 4.0 - dot(n, facing(uv + a)) - dot(n, facing(uv - a)) - dot(n, facing(uv + b)) - dot(n, facing(uv - b));
          float edge = max(smoothstep(0.001, 0.004, jump), smoothstep(0.35, 0.8, fold));
          edge *= 0.8 + 0.35 * noise(at / 16.0); // the pen presses harder in places

          vec3 c = texture2D(tColour, vUv).rgb;
          // Gouache on rough paper: a fine grain, and the paint a little uneven.
          c *= 1.0 + 0.06 * (noise(at / 1.3) - 0.5) + 0.06 * (noise(at / 80.0) - 0.5);
          vec2 d = vUv - 0.5;
          c *= 1.0 - 0.3 * dot(d, d); // a picture book's soft vignette
          gl_FragColor = vec4(mix(c, ink, clamp(edge, 0.0, 1.0)), 1.0);
          #include <colorspace_fragment>
        }`,
    }),
  );
  quad.frustumCulled = false;
  const flat = new THREE.Camera();
  const size = new THREE.Vector2();

  return {
    setSize() {
      renderer.getDrawingBufferSize(size);
      colour.setSize(size.x, size.y);
      shape.setSize(size.x, size.y);
      u.dpr.value = renderer.getPixelRatio();
      u.texel.value.set(1 / size.x, 1 / size.y);
    },
    render(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
      // Shapes: only the inked things, as which way they face. The walls fill the view, so no background is needed.
      const bg = scene.background;
      scene.background = null;
      scene.overrideMaterial = normals;
      camera.layers.set(INK);
      renderer.setRenderTarget(shape);
      renderer.render(scene, camera);
      scene.background = bg;
      scene.overrideMaterial = null;
      camera.layers.set(0);
      renderer.setRenderTarget(colour);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      u.near.value = camera.near;
      u.far.value = camera.far;
      renderer.render(quad, flat);
    },
    dispose() {
      colour.dispose();
      shape.depthTexture?.dispose();
      shape.dispose();
      normals.dispose();
      quad.geometry.dispose();
      quad.material.dispose();
    },
  };
}
