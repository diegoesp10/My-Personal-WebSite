import { useEffect, useRef, useState } from 'react';
import { landMask } from '../assets/land-mask';
import { useLanguage } from '../i18n/LanguageContext';
import type { Language } from '../i18n/languages';
import type { VisitLocation } from '../lib/types';

export type GlobePlace = { latitude: number; longitude: number; label: string };
/** Request to turn the globe towards a point; change `key` to repeat the same place. */
export type GlobeFocus = { latitude: number; longitude: number; key: number };

type Dot = { sinLat: number; cosLat: number; sinLon: number; cosLon: number };
type Vector = [number, number, number];
type Marker = { x: number; y: number; radius: number; place: VisitLocation };

const DEG = Math.PI / 180;
// The stage is always dark ("observatory"), in both themes.
const LAND = '233, 231, 224';
const ACCENT = '255, 106, 61';

let landDots: Dot[] | undefined;

/** Evenly spaced dots (1.6°) on the cells of the land mask. */
function getLandDots(): Dot[] {
  if (landDots) return landDots;
  const raw = atob(landMask.bits);
  const isLand = (latitude: number, longitude: number) => {
    const row = Math.min(landMask.height - 1, Math.max(0, Math.floor(90 - latitude)));
    const column = Math.min(landMask.width - 1, Math.max(0, Math.floor(longitude + 180)));
    const index = row * landMask.width + column;
    return ((raw.charCodeAt(index >> 3) >> (index & 7)) & 1) === 1;
  };
  const dots: Dot[] = [];
  const step = 1.6;
  for (let latitude = -84; latitude <= 84; latitude += step) {
    const ring = Math.max(1, Math.round((360 * Math.cos(latitude * DEG)) / step));
    for (let i = 0; i < ring; i++) {
      const longitude = -180 + ((i + 0.5) * 360) / ring;
      if (!isLand(latitude, longitude)) continue;
      dots.push({
        sinLat: Math.sin(latitude * DEG),
        cosLat: Math.cos(latitude * DEG),
        sinLon: Math.sin(longitude * DEG),
        cosLon: Math.cos(longitude * DEG),
      });
    }
  }
  return (landDots = dots);
}

const toVector = (latitude: number, longitude: number): Vector => [
  Math.cos(latitude * DEG) * Math.sin(longitude * DEG),
  Math.sin(latitude * DEG),
  Math.cos(latitude * DEG) * Math.cos(longitude * DEG),
];

/** Point of the great circle between a and b, raised above the surface towards the middle. */
function arcPoint(a: Vector, b: Vector, angle: number, t: number, lift: number): Vector {
  const sin = Math.sin(angle) || 1;
  const wa = Math.sin((1 - t) * angle) / sin;
  const wb = Math.sin(t * angle) / sin;
  const height = 1 + lift * Math.sin(Math.PI * t);
  return [
    (a[0] * wa + b[0] * wb) * height,
    (a[1] * wa + b[1] * wb) * height,
    (a[2] * wa + b[2] * wb) * height,
  ];
}

const ease = (t: number) => 1 - (1 - t) ** 3;
const clampPitch = (value: number) => Math.max(-1.25, Math.min(1.25, value));

export function Globe({
  places,
  home,
  focus,
  label,
}: {
  places: VisitLocation[];
  home: GlobePlace;
  focus?: GlobeFocus;
  label: string;
}) {
  const { language, t } = useLanguage();
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const placesRef = useRef(places);
  const focusRef = useRef<GlobeFocus | undefined>(focus);
  const [hovered, setHovered] = useState<Marker>();
  placesRef.current = places;
  focusRef.current = focus;

  useEffect(() => {
    const element = canvas.current;
    const container = box.current;
    const context = element?.getContext('2d');
    if (!element || !container || !context) return;

    const dots = getLandDots();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const homeVector = toVector(home.latitude, home.longitude);
    const view = {
      yaw: -home.longitude * DEG,
      pitch: clampPitch(home.latitude * DEG * 0.75),
      velocity: 0,
      dragging: false,
      lastX: 0,
      lastY: 0,
      idleSince: 0,
    };
    let size = 0;
    let frame = 0;
    let visible = false;
    let started = 0;
    let previous = 0;
    let markers: Marker[] = [];
    let seenFocus = focusRef.current?.key;
    let turn:
      | { fromYaw: number; toYaw: number; fromPitch: number; toPitch: number; start: number }
      | undefined;

    const resize = () => {
      size = Math.min(container.clientWidth, 680);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      element.width = Math.round(size * ratio);
      element.height = Math.round(size * ratio);
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (time: number) => {
      const intro = reduced ? 1 : ease(Math.min(1, (time - started) / 1400));
      const radius = size * 0.4 * (0.9 + 0.1 * intro);
      const scale = size / 560;
      const cx = size / 2;
      const cy = size / 2;
      const cosYaw = Math.cos(view.yaw);
      const sinYaw = Math.sin(view.yaw);
      const cosPitch = Math.cos(view.pitch);
      const sinPitch = Math.sin(view.pitch);
      const rotate = (v: Vector): Vector => {
        const x = v[0] * cosYaw + v[2] * sinYaw;
        const z = v[2] * cosYaw - v[0] * sinYaw;
        return [x, v[1] * cosPitch - z * sinPitch, v[1] * sinPitch + z * cosPitch];
      };
      context.clearRect(0, 0, size, size);

      // Atmosphere and body.
      const halo = context.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 1.32);
      halo.addColorStop(0, `rgba(${ACCENT}, ${0.2 * intro})`);
      halo.addColorStop(1, `rgba(${ACCENT}, 0)`);
      context.fillStyle = halo;
      context.beginPath();
      context.arc(cx, cy, radius * 1.32, 0, Math.PI * 2);
      context.fill();
      const body = context.createRadialGradient(
        cx - radius * 0.38,
        cy - radius * 0.42,
        radius * 0.05,
        cx,
        cy,
        radius,
      );
      body.addColorStop(0, '#2a2c31');
      body.addColorStop(1, '#0f1012');
      context.fillStyle = body;
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.fill();

      // Graticule every 30°.
      context.strokeStyle = `rgba(${LAND}, 0.07)`;
      context.lineWidth = 1;
      const line = (points: Vector[]) => {
        context.beginPath();
        let drawing = false;
        for (const point of points) {
          const [x, y, z] = rotate(point);
          if (z < 0) {
            drawing = false;
            continue;
          }
          if (drawing) context.lineTo(cx + x * radius, cy - y * radius);
          else context.moveTo(cx + x * radius, cy - y * radius);
          drawing = true;
        }
        context.stroke();
      };
      for (let latitude = -60; latitude <= 60; latitude += 30)
        line(Array.from({ length: 73 }, (_, i) => toVector(latitude, -180 + i * 5)));
      for (let longitude = -180; longitude < 180; longitude += 30)
        line(Array.from({ length: 37 }, (_, i) => toVector(-90 + i * 5, longitude)));

      // Land: the far side shows through faintly, the near side is shaded by depth.
      const back = new Path2D();
      const near = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      for (const dot of dots) {
        const x = dot.cosLat * (dot.sinLon * cosYaw + dot.cosLon * sinYaw);
        const z0 = dot.cosLat * (dot.cosLon * cosYaw - dot.sinLon * sinYaw);
        const y = dot.sinLat * cosPitch - z0 * sinPitch;
        const z = dot.sinLat * sinPitch + z0 * cosPitch;
        const sx = cx + x * radius;
        const sy = cy - y * radius;
        if (z < 0) {
          back.rect(sx - 0.5, sy - 0.5, 1, 1);
          continue;
        }
        const r = (0.7 + 1.1 * z) * scale;
        near[Math.min(3, Math.floor(z * 4))].rect(sx - r / 2, sy - r / 2, r, r);
      }
      context.fillStyle = `rgba(${LAND}, ${0.08 * intro})`;
      context.fill(back);
      near.forEach((path, bucket) => {
        context.fillStyle = `rgba(${LAND}, ${(0.3 + bucket * 0.22) * intro})`;
        context.fill(path);
      });

      // Arcs from each place to home, with a light travelling along them.
      const shown = placesRef.current.slice(0, 40);
      shown.forEach((place, index) => {
        if (place.latitude === null || place.longitude === null) return;
        const target = toVector(place.latitude, place.longitude);
        const angle = Math.acos(
          Math.min(
            1,
            homeVector[0] * target[0] + homeVector[1] * target[1] + homeVector[2] * target[2],
          ),
        );
        if (angle < 0.02) return;
        const lift = 0.06 + 0.24 * (angle / Math.PI);
        const samples = 40;
        const points: ([number, number] | null)[] = [];
        for (let i = 0; i <= samples; i++) {
          const [x, y, z] = rotate(arcPoint(target, homeVector, angle, i / samples, lift));
          points.push(z > 0 || x * x + y * y > 1 ? [cx + x * radius, cy - y * radius] : null);
        }
        const stroke = (from: number, to: number, style: string, width: number) => {
          context.strokeStyle = style;
          context.lineWidth = width;
          context.beginPath();
          let drawing = false;
          for (
            let i = Math.max(0, Math.floor(from * samples));
            i <= Math.min(samples, Math.ceil(to * samples));
            i++
          ) {
            const point = points[i];
            if (!point) {
              drawing = false;
              continue;
            }
            if (drawing) context.lineTo(point[0], point[1]);
            else context.moveTo(point[0], point[1]);
            drawing = true;
          }
          context.stroke();
        };
        stroke(0, 1, `rgba(${ACCENT}, ${0.28 * intro})`, 1.1 * scale);
        if (!reduced) {
          const head = ((time / 2600 + index * 0.137) % 1.4) - 0.1;
          if (head > 0)
            stroke(
              Math.max(0, head - 0.16),
              Math.min(1, head),
              `rgba(255, 196, 170, ${0.9 * intro})`,
              2 * scale,
            );
        }
      });

      // Places: pulsing rings, glow and core.
      const projected: Marker[] = [];
      shown.concat(placesRef.current.slice(40)).forEach((place, index) => {
        if (place.latitude === null || place.longitude === null) return;
        const [x, y, z] = rotate(toVector(place.latitude, place.longitude));
        if (z < 0.05) return;
        const sx = cx + x * radius;
        const sy = cy - y * radius;
        const r = (2.6 + 1.8 * Math.log2(1 + place.visitors)) * scale;
        const fade = Math.min(1, z * 3) * intro;
        if (!reduced) {
          const phase = (time / 1800 + index * 0.173) % 1;
          context.strokeStyle = `rgba(${ACCENT}, ${(1 - phase) * 0.55 * fade})`;
          context.lineWidth = 1.2 * scale;
          context.beginPath();
          context.arc(sx, sy, r * (1.2 + phase * 2.4), 0, Math.PI * 2);
          context.stroke();
        }
        context.fillStyle = `rgba(${ACCENT}, ${0.22 * fade})`;
        context.beginPath();
        context.arc(sx, sy, r * 1.9, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = `rgba(${ACCENT}, ${fade})`;
        context.beginPath();
        context.arc(sx, sy, r, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = `rgba(255, 240, 232, ${fade})`;
        context.beginPath();
        context.arc(sx, sy, r * 0.38, 0, Math.PI * 2);
        context.fill();
        projected.push({ x: sx, y: sy, radius: r, place });
      });
      markers = projected;

      // Home base.
      const [hx, hy, hz] = rotate(homeVector);
      if (hz > 0) {
        const sx = cx + hx * radius;
        const sy = cy - hy * radius;
        context.strokeStyle = `rgba(255, 255, 255, ${0.9 * intro})`;
        context.lineWidth = 1.4 * scale;
        context.beginPath();
        context.arc(sx, sy, 7 * scale, 0, Math.PI * 2);
        context.stroke();
        context.fillStyle = `rgba(255, 255, 255, ${intro})`;
        context.beginPath();
        context.arc(sx, sy, 2.6 * scale, 0, Math.PI * 2);
        context.fill();
        // Label in a small tag above the cluster of nearby places.
        const fontSize = Math.max(10, 11 * scale);
        const text = home.label.toUpperCase();
        context.font = `600 ${fontSize}px "JetBrains Mono Variable", ui-monospace, monospace`;
        const width = context.measureText(text).width;
        const lx = sx + 12 * scale;
        const ly = sy - 26 * scale;
        context.fillStyle = `rgba(12, 13, 15, ${0.82 * intro})`;
        context.strokeStyle = `rgba(255, 255, 255, ${0.35 * intro})`;
        context.lineWidth = 1;
        context.beginPath();
        context.roundRect(lx, ly - fontSize - 2, width + 14, fontSize + 10, 6);
        context.fill();
        context.stroke();
        context.beginPath();
        context.moveTo(sx + 4 * scale, sy - 4 * scale);
        context.lineTo(lx, ly + 2);
        context.stroke();
        context.fillStyle = `rgba(255, 255, 255, ${0.95 * intro})`;
        context.fillText(text, lx + 7, ly + 2);
      }

      // Rim light.
      context.strokeStyle = `rgba(${ACCENT}, ${0.35 * intro})`;
      context.lineWidth = 1;
      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.stroke();
    };

    const tick = (time: number) => {
      frame = 0;
      if (!visible) return;
      started ||= time;
      const delta = previous ? Math.min(64, time - previous) : 16;
      previous = time;

      const requested = focusRef.current;
      if (requested && requested.key !== seenFocus) {
        seenFocus = requested.key;
        const target = -requested.longitude * DEG;
        // Shortest way round.
        const toYaw =
          view.yaw +
          ((((target - view.yaw) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) -
          Math.PI;
        turn = {
          fromYaw: view.yaw,
          toYaw,
          fromPitch: view.pitch,
          toPitch: clampPitch(requested.latitude * DEG),
          start: time,
        };
        view.velocity = 0;
        view.idleSince = time + 4000;
      }
      if (turn) {
        const t = reduced ? 1 : ease(Math.min(1, (time - turn.start) / 1100));
        view.yaw = turn.fromYaw + (turn.toYaw - turn.fromYaw) * t;
        view.pitch = turn.fromPitch + (turn.toPitch - turn.fromPitch) * t;
        if (t >= 1) turn = undefined;
      } else if (!view.dragging) {
        if (Math.abs(view.velocity) > 0.00001) {
          view.yaw += view.velocity * delta;
          view.velocity *= 0.94;
        } else if (!reduced && time - view.idleSince > 2500) {
          view.yaw += 0.00012 * delta;
        }
      }
      draw(time);
      if (!reduced || turn || view.dragging || Math.abs(view.velocity) > 0.00001)
        frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (visible) frame ||= requestAnimationFrame(tick);
    };

    const down = (event: PointerEvent) => {
      view.dragging = true;
      view.velocity = 0;
      turn = undefined;
      view.lastX = event.clientX;
      view.lastY = event.clientY;
      element.setPointerCapture(event.pointerId);
      setHovered(undefined);
      schedule();
    };
    const move = (event: PointerEvent) => {
      if (view.dragging) {
        const factor = 2.4 / Math.max(200, size);
        const dx = event.clientX - view.lastX;
        view.yaw += dx * factor;
        view.pitch = clampPitch(view.pitch + (event.clientY - view.lastY) * factor);
        view.velocity = (dx * factor) / 16;
        view.lastX = event.clientX;
        view.lastY = event.clientY;
        schedule();
        return;
      }
      const bounds = element.getBoundingClientRect();
      const px = event.clientX - bounds.left;
      const py = event.clientY - bounds.top;
      let best: Marker | undefined;
      let distance = 18;
      for (const marker of markers) {
        const d = Math.hypot(marker.x - px, marker.y - py) - marker.radius;
        if (d < distance) {
          distance = d;
          best = marker;
        }
      }
      setHovered((current) => (current?.place === best?.place ? current : best));
    };
    const up = (event: PointerEvent) => {
      if (!view.dragging) return;
      view.dragging = false;
      view.idleSince = performance.now();
      if (element.hasPointerCapture(event.pointerId))
        element.releasePointerCapture(event.pointerId);
      schedule();
    };
    const leave = () => setHovered(undefined);
    const key = (event: KeyboardEvent) => {
      const step = 8 * DEG;
      if (event.key === 'ArrowLeft') view.yaw += step;
      else if (event.key === 'ArrowRight') view.yaw -= step;
      else if (event.key === 'ArrowUp') view.pitch = clampPitch(view.pitch + step);
      else if (event.key === 'ArrowDown') view.pitch = clampPitch(view.pitch - step);
      else return;
      event.preventDefault();
      view.velocity = 0;
      view.idleSince = performance.now() + 4000;
      schedule();
      if (reduced) draw(performance.now());
    };

    const sizes = new ResizeObserver(() => {
      resize();
      draw(performance.now());
      schedule();
    });
    sizes.observe(container);
    const onScreen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      previous = 0;
      schedule();
    });
    onScreen.observe(container);
    element.addEventListener('pointerdown', down);
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', up);
    element.addEventListener('pointercancel', up);
    element.addEventListener('pointerleave', leave);
    element.addEventListener('keydown', key);
    return () => {
      cancelAnimationFrame(frame);
      sizes.disconnect();
      onScreen.disconnect();
      element.removeEventListener('pointerdown', down);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', up);
      element.removeEventListener('pointercancel', up);
      element.removeEventListener('pointerleave', leave);
      element.removeEventListener('keydown', key);
    };
  }, [home.latitude, home.longitude, home.label]);

  return (
    <div ref={box} className="globe">
      <canvas ref={canvas} role="img" aria-label={label} tabIndex={0} title={t.visits.globeTitle} />
      {hovered && (
        <div
          className="globe-tooltip"
          style={{ left: hovered.x, top: hovered.y - hovered.radius - 10 }}
          role="status"
        >
          <strong>{hovered.place.city || regionName(hovered.place.country, language)}</strong>
          <span>
            {hovered.place.city ? `${regionName(hovered.place.country, language)} · ` : ''}
            {t.visits.visitorCount(hovered.place.visitors)}
          </span>
        </div>
      )}
    </div>
  );
}

const regions = new Map<Language, Intl.DisplayNames>();

/** ES → España · Spain */
export function regionName(code: string, language: Language) {
  try {
    let names = regions.get(language);
    if (!names)
      regions.set(language, (names = new Intl.DisplayNames([language], { type: 'region' })));
    return names.of(code) ?? code;
  } catch {
    return code;
  }
}
