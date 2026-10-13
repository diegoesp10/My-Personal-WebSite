import { useEffect, useRef } from 'react';
import { useThemeColors } from '../lib/useThemeColors';
import { gsap, ScrollTrigger } from '../motion/gsap';
import { introDone } from '../motion/intro';
import { loadGrid, type Grid } from './portraitGrid';

/** WebGL is usable and the visitor allows motion: otherwise the 2D portrait is shown. */
export function canUse3D() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return Boolean(document.createElement('canvas').getContext('webgl'));
  } catch {
    return false;
  }
}

const VERTEX = `
attribute vec3 aBase;
attribute float aSize;
attribute float aSeed;
attribute float aShare;
uniform mat4 uProjection;
uniform float uYaw;
uniform float uPitch;
uniform float uIntro;
uniform float uScatter;
uniform float uTime;
uniform float uPixel;
uniform vec2 uPointer;
uniform float uStrength;
uniform float uScan;
varying float vAccent;
varying float vAlpha;

vec3 direction(float s) {
  float a = s * 43.98;
  float b = fract(s * 13.37) * 2.0 - 1.0;
  float r = sqrt(1.0 - b * b);
  return vec3(cos(a) * r, b, sin(a) * r);
}

void main() {
  float t = clamp(uIntro * 1.6 - aSeed * 0.6, 0.0, 1.0);
  t = 1.0 - pow(1.0 - t, 3.0);
  vec3 p = mix(direction(aSeed) * (1.8 + aSeed * 1.4), aBase, t);
  p.z += sin(uTime * 0.9 + aBase.y * 6.0 + aBase.x * 3.0) * 0.014;

  vec2 d = p.xy - uPointer;
  float lens = uStrength * smoothstep(0.24, 0.0, length(d));
  p.xy += normalize(d + 0.00001) * lens * 0.06;
  p.z += lens * 0.16;

  p += direction(fract(aSeed * 7.31)) * uScatter * (0.35 + aSeed);

  float cy = cos(uYaw);
  float sy = sin(uYaw);
  float cx = cos(uPitch);
  float sx = sin(uPitch);
  p = vec3(cy * p.x + sy * p.z, p.y, -sy * p.x + cy * p.z);
  p = vec3(p.x, cx * p.y - sx * p.z, sx * p.y + cx * p.z);

  vec4 view = vec4(p.xy, p.z - 2.4, 1.0);
  gl_Position = uProjection * view;
  float perspective = 2.4 / max(0.4, -view.z);
  gl_PointSize = max(1.0, aSize * uPixel * perspective * (1.0 + lens * 0.5));

  vAccent = max(smoothstep(0.04, 0.0, abs(aBase.y - uScan)) * t, smoothstep(0.3, 0.9, lens));
  vAlpha = t * (1.0 - uScatter * 0.9) * (0.6 + 0.4 * aShare);
}`;

const FRAGMENT = `
precision mediump float;
uniform vec3 uInk;
uniform vec3 uAccent;
varying float vAccent;
varying float vAlpha;

void main() {
  float alpha = smoothstep(0.5, 0.36, length(gl_PointCoord - 0.5)) * vAlpha;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(mix(uInk, uAccent, vAccent) * alpha, alpha);
}`;

const HEIGHT = 1.62; // model units for the full portrait height
const DEPTH = 0.26; // relief depth

const rgb = (color: string) => {
  const probe = document.createElement('canvas').getContext('2d');
  if (!probe) return [1, 1, 1];
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
};

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(shader) ?? 'shader');
  return shader;
}

/**
 * The dot portrait as a WebGL point cloud. Each dot gets depth from the light of the photo (a bas-relief);
 * on load the dots fly in from space and assemble, the figure turns towards the pointer, dots near it move
 * aside and light up, an accent scan line sweeps it now and then, and scrolling the hero away scatters it.
 * `onFail` falls back to the 2D portrait if WebGL stops working.
 */
export function PortraitField3D({
  label,
  onReady,
  onFail,
}: {
  label: string;
  onReady: (grid: Grid) => void;
  onFail: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const colors = useThemeColors();
  const themed = useRef(colors);
  themed.current = colors;
  const repaint = useRef<() => void>(() => {});

  useEffect(() => repaint.current(), [colors]);

  useEffect(() => {
    const element = canvas.current;
    const container = box.current;
    const gl = element?.getContext('webgl', {
      premultipliedAlpha: true,
      antialias: true,
      alpha: true,
    });
    if (!element || !container || !gl) return onFail();
    let alive = true;
    let cleanup = () => {};

    loadGrid()
      .then((grid) => {
        if (!alive) return;
        onReady(grid);
        cleanup = start(gl, element, container, grid);
      })
      .catch(onFail);

    function start(
      gl: WebGLRenderingContext,
      element: HTMLCanvasElement,
      container: HTMLDivElement,
      grid: Grid,
    ) {
      const program = gl.createProgram()!;
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
      gl.linkProgram(program);
      gl.useProgram(program);
      const uniform = (name: string) => gl.getUniformLocation(program, name);
      const u = {
        projection: uniform('uProjection'),
        yaw: uniform('uYaw'),
        pitch: uniform('uPitch'),
        intro: uniform('uIntro'),
        scatter: uniform('uScatter'),
        time: uniform('uTime'),
        pixel: uniform('uPixel'),
        pointer: uniform('uPointer'),
        strength: uniform('uStrength'),
        scan: uniform('uScan'),
        ink: uniform('uInk'),
        accent: uniform('uAccent'),
      };

      // One vertex per dot: position with relief, seed, share of the cell; size depends on the theme.
      const width = HEIGHT * (grid.columns / grid.rows);
      const base: number[] = [];
      const seeds: number[] = [];
      const shares: number[] = [];
      const tones: number[] = [];
      for (let row = 0; row < grid.rows; row++)
        for (let column = 0; column < grid.columns; column++) {
          const index = row * grid.columns + column;
          const share = grid.share[index];
          if (!share) continue;
          const tone = grid.tone[index];
          base.push(
            ((column + 0.5) / grid.columns - 0.5) * width,
            (0.5 - (row + 0.5) / grid.rows) * HEIGHT,
            (0.5 - tone) * DEPTH,
          );
          seeds.push(Math.random());
          shares.push(share);
          tones.push(tone);
        }
      const count = seeds.length;
      const attribute = (name: string, data: number[], size: number) => {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        const location = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
        return buffer;
      };
      attribute('aBase', base, 3);
      attribute('aSeed', seeds, 1);
      attribute('aShare', shares, 1);
      const sizeBuffer = gl.createBuffer();
      const sizeLocation = gl.getAttribLocation(program, 'aSize');
      gl.enableVertexAttribArray(sizeLocation);

      // Same rule as the 2D portrait: on a light theme dot size follows shadow, on a dark one light.
      const upload = () => {
        const { dark, ink, accent } = themed.current;
        const sizes = new Float32Array(count);
        for (let i = 0; i < count; i++) {
          const amount = dark ? (1 - tones[i]) ** 1.35 : tones[i] ** 0.75;
          sizes[i] = 1.04 * (0.12 + 0.88 * amount) * (0.35 + 0.65 * shares[i]);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
        gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, 0, 0);
        gl.uniform3fv(u.ink, rgb(ink));
        gl.uniform3fv(u.accent, rgb(accent));
      };
      const paint = () => {
        upload();
        draw();
      };

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);

      const state = { intro: 0, scatter: 0, yaw: 0, pitch: 0, x: 0, y: 0, strength: 0 };
      const target = { yaw: 0, pitch: 0, x: 0, y: 0, strength: 0 };
      let inside = false;
      let visible = true;
      let pixel = 1;

      const resize = () => {
        const cssWidth = container.clientWidth;
        const cssHeight = cssWidth * (grid.rows / grid.columns);
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        element.style.height = `${cssHeight}px`;
        element.width = Math.round(cssWidth * ratio);
        element.height = Math.round(cssHeight * ratio);
        gl.viewport(0, 0, element.width, element.height);
        // Perspective sized so the portrait fills the canvas at rest.
        const aspect = element.width / element.height;
        const f = 2.4 / (HEIGHT / 2) / 1.04;
        const near = 0.1;
        const far = 10;
        gl.uniformMatrix4fv(u.projection, false, [
          f / aspect,
          0,
          0,
          0,
          0,
          f,
          0,
          0,
          0,
          0,
          (far + near) / (near - far),
          -1,
          0,
          0,
          (2 * far * near) / (near - far),
          0,
        ]);
        pixel = (element.height / grid.rows) * 1.0;
        draw();
      };

      function draw(time = performance.now()) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        const seconds = time / 1000;
        gl.uniform1f(u.time, seconds);
        gl.uniform1f(u.intro, state.intro);
        gl.uniform1f(u.scatter, state.scatter);
        gl.uniform1f(u.yaw, state.yaw + (inside ? 0 : Math.sin(seconds * 0.4) * 0.08));
        gl.uniform1f(u.pitch, state.pitch);
        gl.uniform2f(u.pointer, state.x, state.y);
        gl.uniform1f(u.strength, state.strength);
        gl.uniform1f(u.pixel, pixel);
        // The scan line sweeps the figure for a few seconds every nine.
        gl.uniform1f(u.scan, 0.9 - ((seconds / 9) % 1) * 4.2);
        gl.drawArrays(gl.POINTS, 0, count);
      }

      const tick = () => {
        if (!visible || document.hidden) return;
        for (const key of ['yaw', 'pitch', 'x', 'y', 'strength'] as const)
          state[key] += (target[key] - state[key]) * 0.08;
        draw();
      };
      gsap.ticker.add(tick);

      const move = (event: PointerEvent) => {
        const bounds = element.getBoundingClientRect();
        const nx = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        const ny = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
        inside = true;
        target.yaw = nx * 0.5;
        target.pitch = ny * 0.32;
        target.x = (nx * width) / 2;
        target.y = (-ny * HEIGHT) / 2;
        target.strength = 1;
      };
      const leave = () => {
        inside = false;
        target.yaw = target.pitch = target.strength = 0;
      };
      element.addEventListener('pointermove', move);
      element.addEventListener('pointerleave', leave);

      const sizes = new ResizeObserver(resize);
      upload();
      sizes.observe(container);
      resize();
      repaint.current = paint;

      const seen = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
      seen.observe(container);
      // Assemble once the intro is over and the portrait is on screen.
      let assembled = false;
      const assemble = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting || assembled) return;
          assembled = true;
          introDone().then(() => gsap.to(state, { intro: 1, duration: 2.8, ease: 'power2.out' }));
        },
        { threshold: 0.2 },
      );
      assemble.observe(container);
      // Scrolling the hero away scatters the figure, once half of it has left the screen: starting earlier broke
      // it apart while it was still fully in view on tall windows.
      const scatter = ScrollTrigger.create({
        trigger: container,
        start: 'center top',
        end: 'bottom top',
        scrub: 0.6,
        onUpdate: (self) => (state.scatter = self.progress * 0.7),
      });

      const lost = (event: Event) => {
        event.preventDefault();
        onFail();
      };
      element.addEventListener('webglcontextlost', lost);
      return () => {
        gsap.ticker.remove(tick);
        gsap.killTweensOf(state);
        scatter.kill();
        sizes.disconnect();
        seen.disconnect();
        assemble.disconnect();
        element.removeEventListener('pointermove', move);
        element.removeEventListener('pointerleave', leave);
        element.removeEventListener('webglcontextlost', lost);
        repaint.current = () => {};
      };
    }

    return () => {
      alive = false;
      cleanup();
    };
  }, []);

  return (
    <div ref={box} className="dot-canvas dot-canvas-3d">
      <canvas ref={canvas} role="img" aria-label={label} />
    </div>
  );
}
