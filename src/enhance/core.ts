"use client";
/* Generic behaviours that attach to the markup hooks of every page (written by hand; the markup itself is recovered from the build).
   Each function returns a cleanup. All animation uses transform / opacity / clip-path only and is skipped for reduced motion. */
import { gsap, ScrollTrigger, EASE, reducedMotion } from "@/lib/gsap";
import { DUR } from "@/lib/motion-tokens";

const all = <T extends Element>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

/** Elements marked data-reveal fade and rise once when they come into view. */
export function reveals(): () => void {
  const els = all<HTMLElement>("[data-reveal]");
  if (reducedMotion() || !("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return () => {}; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { (e.target as HTMLElement).classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  els.forEach((e) => io.observe(e));
  return () => io.disconnect();
}

/** Headlines: every .st-line rises out of its mask; .st-open / .xp-sub fade up; .st-media opens from below with a settling zoom. */
export function textAndMedia(): () => void {
  if (reducedMotion()) return () => {};
  const sts: ScrollTrigger[] = [];
  const once = (el: Element, run: () => void, start = "top 88%") => sts.push(ScrollTrigger.create({ trigger: el, start, once: true, onEnter: run }));
  all<HTMLElement>(".st-line").forEach((line) => {
    const span = line.firstElementChild as HTMLElement | null; if (!span) return;
    gsap.set(span, { yPercent: 112, opacity: 1 });
    once(line, () => gsap.to(span, { yPercent: 0, duration: DUR.xl, ease: EASE.settle }));
  });
  all<HTMLElement>(".st-open, .xp-sub").forEach((el) => { gsap.set(el, { opacity: 0, y: 18 }); once(el, () => gsap.to(el, { opacity: 1, y: 0, duration: DUR.lg, ease: EASE.settle, delay: 0.15 })); });
  all<HTMLElement>(".st-media").forEach((m) => {
    const inner = m.querySelector<HTMLElement>(".st-media-in");
    gsap.set(m, { clipPath: "inset(100% 0 0)" }); if (inner) gsap.set(inner, { scale: 1.25 });
    once(m, () => { gsap.to(m, { clipPath: "inset(0% 0 0)", duration: DUR.xl, ease: EASE.pass, clearProps: "clipPath" }); if (inner) gsap.to(inner, { scale: 1, duration: DUR.xxl, ease: EASE.settle }); }, "top 85%");
  });
  return () => sts.forEach((s) => s.kill());
}

/** Overlapping stages (the sticky story scenes): the stage shows when its section is reached. */
export function stages(): () => void {
  const sts = all<HTMLElement>(".ph-sec").map((sec) => ScrollTrigger.create({ trigger: sec, start: "top top", end: "max", toggleClass: { targets: all(".ph-stick", sec), className: "is-live" } }));
  return () => sts.forEach((s) => s.kill());
}

/** Films: a .film holds a poster image and an empty <video>; the file is the poster's name with .mp4 (the poster is always cut from the film).
    Loads when near the screen, plays while visible, pauses when it leaves. Reduced motion: poster only. */
export function films(): () => void {
  if (reducedMotion()) return () => {};
  const mobile = matchMedia("(max-width:860px)").matches;
  type Item = { box: HTMLElement; v: HTMLVideoElement; poster: string };
  const items: Item[] = [], seen = new WeakSet<Element>();
  const onPlay = (v: HTMLVideoElement) => () => v.classList.add("is-playing");
  const handlers = new Map<HTMLVideoElement, () => void>();
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const it = items.find((i) => i.box === e.target); if (!it) return;
    if (e.isIntersecting) {
      if (!it.v.getAttribute("src")) { it.v.src = it.poster; it.v.preload = "auto"; const h = onPlay(it.v); handlers.set(it.v, h); it.v.addEventListener("playing", h); }
      it.v.play().catch(() => {});
    } else it.v.pause();
  }), { rootMargin: "25% 0px" });
  const scan = () => all<HTMLElement>(".film").forEach((box) => {
    if (seen.has(box)) return; const v = box.querySelector("video"), img = box.querySelector("img"); if (!v || !img) return;
    seen.add(box); items.push({ box, v, poster: (img.currentSrc || img.src).replace(location.origin, "").replace(/\.webp(\?.*)?$/, ".mp4") }); io.observe(box);
  });
  scan(); addEventListener("cdb:films", scan);
  void mobile;
  return () => { removeEventListener("cdb:films", scan); io.disconnect(); handlers.forEach((h, v) => v.removeEventListener("playing", h)); };
}
