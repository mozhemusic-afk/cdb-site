"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { BEZIER } from "./motion-tokens";

/* GSAP is registered once, here. The easing curves are the same control points as the CSS custom properties. */
let ready = false;
export function initGsap() {
  if (ready || typeof window === "undefined") return;
  ready = true;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  ScrollTrigger.config({ ignoreMobileResize: true });
  for (const [k, v] of Object.entries(BEZIER)) CustomEase.create(`cdb.${k}`, `M0,0 C${v[0]},${v[1]} ${v[2]},${v[3]} 1,1`);
}
initGsap();

export const EASE = { settle: "cdb.settle", pass: "cdb.pass", breath: "cdb.breath", exit: "cdb.exit", cut: "steps(5)" } as const;
export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
export const isMobile = () => typeof window !== "undefined" && window.matchMedia("(max-width: 860px)").matches;
export { gsap, ScrollTrigger };
