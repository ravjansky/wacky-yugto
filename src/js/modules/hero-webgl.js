/**
 * HERO WEBGL · the portrait, duotoned in-shader.
 *
 * Why WebGL rather than the CSS .duotone primitive: the shader runs the same
 * two-pass recipe (ink multiply, coral screen) but can additionally displace
 * the sample point per-pixel. That buys three things CSS can't do — a pointer-
 * driven lens warp, a scroll-driven RGB split, and grain that lives under the
 * duotone instead of over the whole page.
 *
 * The CSS .duotone fallback in the markup stays put unless this module reports
 * success, so no-WebGL and reduced-motion users still get a treated portrait.
 */

import * as THREE from "three";

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  uniform sampler2D uMap;
  uniform vec2  uCover;      // uv scale for object-fit: cover
  uniform vec2  uOffset;     // uv offset for object-fit: cover
  uniform vec2  uPointer;    // -1..1, eased
  uniform float uTime;
  uniform float uScroll;     // 0..1 through the hero
  uniform float uEnter;      // 0..1 entrance progress
  uniform vec3  uInk;
  uniform vec3  uCoral;
  uniform vec3  uBone;
  uniform float uBlack;      // levels: input black point
  uniform float uWhite;      // levels: input white point

  varying vec2 vUv;

  // Cheap hash noise — grain, not a texture fetch.
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // Map the plane's uv into the texture's cover-fitted uv.
    vec2 uv = vUv * uCover + uOffset;

    // Pointer lens: push samples away from the cursor, falling off with
    // distance. Subtle — this should read as heat haze, not a fisheye.
    vec2 toPointer = vUv - (uPointer * 0.5 + 0.5);
    float lens = smoothstep(0.55, 0.0, length(toPointer));
    uv -= toPointer * lens * 0.045;

    // Slow breathing drift so the plate is never perfectly static.
    uv.y += sin(uTime * 0.25 + vUv.x * 2.2) * 0.0016;

    // Scroll-driven chromatic split, strongest as the hero leaves.
    float split = uScroll * 0.006 + lens * 0.0018;
    float r = texture2D(uMap, uv + vec2(split, 0.0)).r;
    float g = texture2D(uMap, uv).g;
    float b = texture2D(uMap, uv - vec2(split, 0.0)).b;
    vec3 src = vec3(r, g, b);

    // --- The Sediment duotone, in shader ---
    // A true luminance ramp rather than a literal transcription of the CSS
    // multiply/screen stack. Transcribing the blend modes maps this portrait
    // (black clothing on a red backdrop) almost entirely into --ink and it
    // reads as a black rectangle. The ramp delivers what the system actually
    // specifies — shadows into green, highlights lifted pink — on a subject
    // this dark. The CSS .duotone fallback keeps the literal recipe.
    float lum = dot(src, vec3(0.2126, 0.7152, 0.0722));

    // Levels: stretch the portrait's usable range before mapping. Without
    // this the whole figure sits in the bottom third of the ramp.
    lum = clamp((lum - uBlack) / (uWhite - uBlack), 0.0, 1.0);
    lum = clamp((lum - 0.5) * 1.15 + 0.5, 0.0, 1.0); // contrast(1.15)

    vec3 col = mix(uInk, uCoral, smoothstep(0.0, 1.0, lum));
    // Let the brightest highlights run past coral toward bone, so the face
    // and hands keep some sparkle instead of flattening at the ramp's top.
    col = mix(col, uBone, smoothstep(0.72, 1.0, lum) * 0.55);

    // Grain, under the duotone.
    float grain = (hash(vUv * 900.0 + uTime * 0.6) - 0.5) * 0.055;
    col += grain;

    // Vignette — pulls the band's edges into the gradient behind it.
    float vig = smoothstep(1.05, 0.35, length(vUv - 0.5));
    col = mix(col * 0.82, col, vig);

    // Entrance: a wipe from the bottom, matching --ease-signature's feel.
    float wipe = smoothstep(0.0, 0.85, uEnter * 1.35 - (1.0 - vUv.y) * 0.35);

    gl_FragColor = vec4(col, wipe);
  }
`;

export function initHeroWebGL({ canvas, band, src, reducedMotion }) {
  // A treated portrait already exists in CSS. Only replace it if we can do
  // strictly better — otherwise leave the fallback alone.
  if (reducedMotion) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    return null; // No WebGL context — CSS duotone stands.
  }

  const scene = new THREE.Scene();
  // Orthographic: the plane is a flat plate, perspective would only distort it.
  const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 10);
  camera.position.z = 1;

  const uniforms = {
    uMap: { value: null },
    uCover: { value: new THREE.Vector2(1, 1) },
    uOffset: { value: new THREE.Vector2(0, 0) },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uEnter: { value: 0 },
    uInk: { value: new THREE.Color(0x0e2a21) },
    uCoral: { value: new THREE.Color(0xe89789) },
    uBone: { value: new THREE.Color(0xf4ede2) },
    // Tuned to this portrait. The white point sits low because the backdrop is
    // saturated red — luminance ~0.22 — so a normal white point maps the whole
    // frame into the ramp's bottom third and the plate reads as a black hole
    // punched in the gradient. Retune if the photo is ever swapped.
    uBlack: { value: 0.02 },
    uWhite: { value: 0.4 },
  };

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
    })
  );
  scene.add(mesh);

  let imageAspect = 1;
  let ready = false;

  const setSize = () => {
    const { clientWidth: w, clientHeight: h } = band;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);

    // object-fit: cover, computed in uv space.
    const boxAspect = w / h;
    if (imageAspect > boxAspect) {
      // Image wider than box — crop the sides.
      uniforms.uCover.value.set(boxAspect / imageAspect, 1);
      uniforms.uOffset.value.set((1 - boxAspect / imageAspect) / 2, 0);
    } else {
      // Image taller than box — crop top/bottom, biased up to keep the face.
      const s = imageAspect / boxAspect;
      uniforms.uCover.value.set(1, s);
      uniforms.uOffset.value.set(0, (1 - s) * 0.22);
    }
  };

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointerMove = (e) => {
    const r = band.getBoundingClientRect();
    // Track relative to the band's centre, in viewport-ish units, so the lens
    // still responds when the cursor is outside the (narrow) band itself.
    pointer.tx = ((e.clientX - (r.left + r.width / 2)) / window.innerWidth) * 2;
    pointer.ty = -((e.clientY - (r.top + r.height / 2)) / window.innerHeight) * 2;
  };

  const loader = new THREE.TextureLoader();

  return new Promise((resolve) => {
    loader.load(
      src,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        uniforms.uMap.value = texture;
        imageAspect = texture.image.width / texture.image.height;
        ready = true;

        setSize();
        window.addEventListener("resize", setSize);
        window.addEventListener("pointermove", onPointerMove, { passive: true });

        const clock = new THREE.Clock();
        let frame;

        const render = () => {
          frame = requestAnimationFrame(render);
          if (!ready) return;

          uniforms.uTime.value = clock.getElapsedTime();

          // Ease the pointer rather than tracking it raw — raw tracking reads
          // as twitchy at this displacement scale.
          pointer.x += (pointer.tx - pointer.x) * 0.055;
          pointer.y += (pointer.ty - pointer.y) * 0.055;
          uniforms.uPointer.value.set(pointer.x, pointer.y);

          renderer.render(scene, camera);
        };
        render();

        const api = {
          /** Entrance wipe, driven by the preloader's exit timeline. */
          setEnter: (v) => {
            uniforms.uEnter.value = v;
          },
          /** Hero scroll progress, driven by ScrollTrigger. */
          setScroll: (v) => {
            uniforms.uScroll.value = v;
          },
          destroy: () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("resize", setSize);
            window.removeEventListener("pointermove", onPointerMove);
            texture.dispose();
            mesh.geometry.dispose();
            mesh.material.dispose();
            renderer.dispose();
          },
        };
        resolve(api);
      },
      undefined,
      () => resolve(null) // Texture failed — CSS duotone stands.
    );
  });
}
