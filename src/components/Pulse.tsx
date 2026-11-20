"use client";
import { useEffect, useRef } from "react";
import { firePulse, flatPulse } from "@/lib/pulse";
import { gsap } from "@/lib/gsap";

/* The Pulse as a divider/accent. Static (a straight hairline) until it is seen, then one beat travels along it.
   `fireKey` fires it again when it changes (selection, hover, route). Sound energy (0..1) can scale it via `window.__cdbEnergy`. */
export function Pulse({ className = "", amp = 12, fireKey, height = 36, once = true, decorative = true }: { className?: string; amp?: number; fireKey?: string | number; height?: number; once?: boolean; decorative?: boolean }) {
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const tw = useRef<gsap.core.Tween | null>(null);
  const seen = useRef(false);

  const fire = () => {
    const p = path.current; if (!p) return;
    tw.current?.kill();
    const e = (window as unknown as { __cdbEnergy?: number }).__cdbEnergy;
    tw.current = firePulse(p, { amp, h: height, energy: typeof e === "number" ? 0.4 + e * 0.9 : 1 });
  };
  useEffect(() => {
    const el = svg.current; if (!el) return;
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && (!once || !seen.current)) { seen.current = true; fire(); } }), { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); tw.current?.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (fireKey !== undefined && seen.current) fire(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [fireKey]);

  return (
    <svg ref={svg} viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none" className={"pulse block w-full overflow-visible " + className} style={{ height }} aria-hidden={decorative} focusable="false">
      <path ref={path} d={flatPulse(1000, height)} fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
