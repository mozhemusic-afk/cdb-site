"use client";
import { useEffect, useRef } from "react";
import { firePulse, flatPulse } from "@/lib/pulse";
import { gsap, reducedMotion } from "@/lib/gsap";

/* A headline the Pulse travels through. Letters are real spans (the text stays one headline for search and screen readers);
   a hairline under the title carries one beat, and every letter lifts by the displacement of that same curve as the beat passes,
   then settles. Fires when the title has loaded (`when="load"`) or comes into view (`when="view"`), and again when the pointer
   (or a tap) touches it. Transform only. Reduced motion: plain type and a straight hairline. */
type Props = { lines: string[]; as?: "h1" | "h2"; className?: string; when?: "load" | "view"; amp?: number; line?: boolean; delay?: number; lineClass?: string; wrapperClass?: string };

export function PulseTitle({ lines, as: Tag = "h1", className = "", when = "load", amp = 14, line = true, delay = 0, lineClass = "text-bone/50", wrapperClass = "" }: Props) {
  const root = useRef<HTMLElement>(null);
  const path = useRef<SVGPathElement>(null);
  const busy = useRef(false);
  const last = useRef(0);

  const fire = () => {
    const el = root.current, p = path.current; if (!el || !p || busy.current) return;
    const box = el.getBoundingClientRect(); if (!box.width) return;
    const ls = Array.from(el.querySelectorAll<HTMLElement>(".pl")), fr = ls.map((l) => { const r = l.getBoundingClientRect(); return (r.left + r.width / 2 - box.left) / box.width; });
    const small = innerWidth < 700, A = small ? amp * 0.65 : amp;
    busy.current = true; last.current = performance.now();
    firePulse(p, { w: 1000, h: 40, amp: line ? 14 : 0, duration: 1.5, onFrame: (c) => {
      ls.forEach((l, i) => { const u = (c - fr[i]) / 0.07; gsap.set(l, { y: c > 1.5 ? 0 : -A * Math.exp(-u * u) * Math.cos(u * 1.7) }); });
      if (c > 1.5) busy.current = false;
    } });
  };

  useEffect(() => {
    const el = root.current; if (!el || reducedMotion()) return;
    const start = () => setTimeout(fire, 450 + delay);
    let t: ReturnType<typeof setTimeout> | undefined, io: IntersectionObserver | undefined;
    if (when === "view" && "IntersectionObserver" in window) { io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { t = start(); io?.disconnect(); } }), { threshold: 0.6 }); io.observe(el); }
    else t = start();
    const touch = () => { if (performance.now() - last.current > 2500) fire(); };
    el.addEventListener("pointerenter", touch, { passive: true }); el.addEventListener("pointerdown", touch, { passive: true });
    return () => { clearTimeout(t); io?.disconnect(); el.removeEventListener("pointerenter", touch); el.removeEventListener("pointerdown", touch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={"pulse-title " + wrapperClass}>
      <Tag ref={root as never} className={className} aria-label={lines.join(" ")}>
        {lines.map((ln, i) => (
          <span key={i} className="mask-line pt-line" aria-hidden="true">
            <span className="intro-line" style={{ ["--i" as string]: i, ["--d" as string]: `${delay}ms` }}>
              {ln.split(" ").map((w, j, a) => (<span key={j}><span className="inline-block whitespace-nowrap">{Array.from(w).map((ch, k) => <span key={k} className="pl inline-block">{ch}</span>)}</span>{j < a.length - 1 ? " " : ""}</span>))}
            </span>
          </span>
        ))}
      </Tag>
      {line && <svg viewBox="0 0 1000 40" preserveAspectRatio="none" className={"pulse mt-6 block h-10 w-full overflow-visible " + lineClass} aria-hidden="true" focusable="false"><path ref={path} d={flatPulse(1000, 40)} fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" /></svg>}
    </div>
  );
}
