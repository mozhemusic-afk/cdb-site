/* THE PULSE: CDB's signature line. A hairline that is straight at rest; a pulse (a short burst of displacement that decays
   into a ripple) travels along it. Pure geometry and one GSAP tween: no canvas, no audio needed. With sound on, `energy`
   (0..1, from the audio analyser) scales the amplitude; with sound off it is a fixed, composed beat. */
import { gsap, EASE, reducedMotion } from "./gsap";
import { DUR } from "./motion-tokens";

export type PulseShape = { w: number; h: number; c: number; amp: number; sigma?: number; lambda?: number };
const N = 140;

/** SVG path of a line with a pulse centred at fraction `c` of the width (c outside 0..1 = at rest). */
export function pulsePath({ w, h, c, amp, sigma = 0.05, lambda = 0.045 }: PulseShape): string {
  const mid = h / 2, cx = c * w;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * w, u = (x - cx) / w;
    const env = Math.exp(-((u / sigma) ** 2));
    // an asymmetric burst: a sharp lead, then a decaying ripple behind the front
    const trail = u < 0 ? 1 + 0.9 * Math.min(1, -u / (sigma * 3)) : 0.55;
    const y = mid - amp * env * Math.cos((u / lambda) * Math.PI) * trail;
    d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(2);
  }
  return d;
}

/** Fires one pulse along `path` (an SVG <path>), returns the tween. Static (flat line) when reduced motion is on. */
export function firePulse(path: SVGPathElement, { w = 1000, h = 40, amp = 14, duration = DUR.xl, energy = 1, onMid, onFrame, delay = 0 }: { w?: number; h?: number; amp?: number; duration?: number; energy?: number; onMid?: () => void; onFrame?: (c: number) => void; delay?: number } = {}) {
  const flat = pulsePath({ w, h, c: -1, amp: 0 });
  if (reducedMotion()) { path.setAttribute("d", flat); onMid?.(); return null; }
  const o = { c: -0.12, a: amp * Math.max(0.35, energy) };
  let mid = false;
  return gsap.to(o, {
    c: 1.12, duration, delay, ease: EASE.pass,
    onUpdate: () => {
      path.setAttribute("d", pulsePath({ w, h, c: o.c, amp: o.a }));
      onFrame?.(o.c);
      if (!mid && o.c > 0.5) { mid = true; onMid?.(); }
    },
    onComplete: () => { path.setAttribute("d", flat); onFrame?.(2); },
  });
}
export const flatPulse = (w = 1000, h = 40) => pulsePath({ w, h, c: -1, amp: 0 });
