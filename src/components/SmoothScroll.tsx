"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, finePointer, reducedMotion } from "@/lib/gsap";

/* Inertial scrolling for desktop mouse users only (never touch, never reduced motion), synchronised with ScrollTrigger. */
export function SmoothScroll() {
  useEffect(() => {
    if (!finePointer() || reducedMotion()) return;
    const l = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3), smoothWheel: true });
    window.__lenis = l as unknown as Window["__lenis"];
    l.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); l.destroy(); window.__lenis = undefined; };
  }, []);
  return null;
}
