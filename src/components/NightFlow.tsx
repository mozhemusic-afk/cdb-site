"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger, reducedMotion } from "@/lib/gsap";
import { firePulse, flatPulse } from "@/lib/pulse";
import { HOME_PHASES, NIGHT, phaseForPath, type Phase } from "@/lib/night";

/* THE NIGHT FLOW: one hairline on the left edge for the whole site. It is nearly flat while the night is about to begin, answers in the middle,
   is fullest in the worlds and decays to a warm straight line at the end. It takes a beat on the 0.6 s grid (or on measured audio energy when
   sound is on). One SVG path, no canvas, no scroll listener of its own, no loop while the tab is hidden. Reduced motion: a straight line and the
   marker only. A marker dot shows how far into the night you are. */
export function NightFlow() {
  const path = useRef<SVGPathElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const phase = useRef<Phase>("anticipation");
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const route = usePathname();

  const fire = (full = false) => {
    const p = path.current; if (!p || document.hidden || reducedMotion()) return;
    const n = NIGHT[phase.current], e = window.__cdbEnergy;
    firePulse(p, { w: 1000, h: 40, amp: n.amp * (innerWidth < 640 ? 0.55 : 1) * (typeof e === "number" ? 0.4 + e * 0.9 : 1) * (full ? 1.2 : 1), duration: n.dur });
  };
  const setPhase = (ph: Phase) => {
    if (phase.current === ph && timer.current !== undefined) return;
    phase.current = ph; const n = NIGHT[ph];
    if (wrap.current) wrap.current.style.color = n.color;
    document.documentElement.style.setProperty("--night", n.tint);
    clearInterval(timer.current); timer.current = undefined;
    fire(true);
    if (n.every && !reducedMotion()) timer.current = setInterval(() => fire(), n.every * 1000);
    else timer.current = setInterval(() => {}, 1 << 30);   // afterglow: one decaying beat, then stillness
  };

  useEffect(() => {
    const sts: ScrollTrigger[] = [];
    if (route === "/") {
      for (const [id, ph] of HOME_PHASES) {
        const el = document.getElementById(id); if (!el) continue;
        sts.push(ScrollTrigger.create({ trigger: el, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setPhase(ph) }));
      }
      setPhase("anticipation");
    } else setPhase(phaseForPath(route));
    const mk = ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => { if (dot.current) dot.current.style.transform = `translateY(${(s.progress * 100).toFixed(1)}%)`; } });
    const vis = () => { if (!document.hidden) fire(); };
    document.addEventListener("visibilitychange", vis);
    return () => { sts.forEach((s) => s.kill()); mk.kill(); document.removeEventListener("visibilitychange", vis); clearInterval(timer.current); timer.current = undefined; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  return (
    <div ref={wrap} className="night-flow pointer-events-none fixed left-0 top-1/2 z-[60]" aria-hidden="true" style={{ color: NIGHT.anticipation.color }}>
      <div className="nf-rot">
        <svg viewBox="0 0 1000 40" preserveAspectRatio="none" className="block overflow-visible" focusable="false"><path ref={path} d={flatPulse(1000, 40)} fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" /></svg>
      </div>
      <span ref={dot} className="nf-dot" />
    </div>
  );
}
