"use client";
/* The exhibition of the four worlds (home scene 03 and /experiences/). Each world enters with its own geometry (a dissolve, a slanted wipe, an
   iris, a curtain), its own title grammar and the same counter. Keyboard (arrows), swipe, and the tab list all drive one function; a new
   choice while a cut is playing fast-forwards it. Only the active room's film plays. Pulse fires along the wall line on every change. */
import { gsap, EASE, reducedMotion } from "@/lib/gsap";
import { DUR } from "@/lib/motion-tokens";
import { firePulse } from "@/lib/pulse";

type Geo = { from: string; to: string; opacity?: boolean };
const GEO: Record<string, Geo> = {
  noema: { from: "inset(0 0 0 0)", to: "inset(0 0 0 0)", opacity: true },
  xoxo: { from: "polygon(0 0, 0 0, -18% 100%, -18% 100%)", to: "polygon(0 0, 118% 0, 100% 100%, -18% 100%)" },
  hypnotized: { from: "circle(0% at 50% 50%)", to: "circle(78% at 50% 50%)" },
  "casa-del-ritmo": { from: "inset(0 0 100% 0)", to: "inset(0 0 0% 0)" },
};

function titleIn(slug: string, letters: HTMLElement[], tl: gsap.core.Timeline, at: number) {
  if (!letters.length) return;
  gsap.set(letters, { opacity: 0 });
  if (slug === "xoxo") tl.fromTo(letters, { opacity: 1, xPercent: (i: number) => (i % 2 ? 60 : -60) }, { xPercent: 0, duration: DUR.sm, ease: EASE.cut, stagger: 0.05 }, at);
  else if (slug === "hypnotized") { const mid = (letters.length - 1) / 2; tl.fromTo(letters, { opacity: 0, x: (i: number) => (i - mid) * -26 }, { opacity: 1, x: 0, duration: DUR.xl, ease: EASE.settle, stagger: 0.04 }, at); }
  else if (slug === "casa-del-ritmo") tl.fromTo(letters, { opacity: 1, yPercent: 112 }, { yPercent: 0, duration: DUR.lg, ease: EASE.settle, stagger: 0.05 }, at);
  else tl.fromTo(letters, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: DUR.xl, ease: EASE.breath, stagger: 0.14 }, at);
}

export function selector(): () => void {
  const root = document.querySelector<HTMLElement>(".ex-stage"); if (!root) return () => {};
  const slides = Array.from(root.querySelectorAll<HTMLElement>("[data-slide]")), copies = Array.from(root.querySelectorAll<HTMLElement>("[data-copy]"));
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]')); const N = slides.length; if (!N) return () => {};
  const slug = (i: number) => (tabs[i]?.id || "").replace("ex-tab-", "");
  const counter = root.querySelector<HTMLElement>("p.tabnum span span"), pulse = root.querySelector<SVGPathElement>("svg.pulse path");
  const vids = slides.map((s) => s.querySelector<HTMLVideoElement>("video"));
  const reduce = reducedMotion();
  let cur = 0, tl: gsap.core.Timeline | null = null, z = 5;

  const play = (i: number, on: boolean) => {
    const v = vids[i]; if (!v) return;
    if (!on) { v.pause(); return; }
    if (reduce) return;
    if (!v.getAttribute("src")) { const img = slides[i].querySelector("img"); if (img) { v.src = (img.currentSrc || img.src).replace(location.origin, "").replace(/\.webp(\?.*)?$/, ".mp4"); v.addEventListener("playing", () => { v.style.opacity = "1"; }, { once: true }); v.load(); } }
    v.play().catch(() => {});
  };
  const setUi = (i: number) => {
    tabs.forEach((t, k) => { t.setAttribute("aria-selected", String(k === i)); t.tabIndex = k === i ? 0 : -1; t.style.opacity = k === i ? "1" : "0.55"; const bar = t.querySelector<HTMLElement>("span.origin-left"); if (bar) bar.style.transform = `scaleX(${k === i ? 1 : 0})`; });
    copies.forEach((c, k) => { c.toggleAttribute("inert", k !== i); });
    if (counter) { counter.textContent = String(i + 1).padStart(2, "0"); counter.classList.remove("intro-line"); void counter.offsetWidth; counter.classList.add("intro-line"); }
  };
  const go = (to: number, immediate = false) => {
    to = (to + N) % N; if (to === cur && !immediate) return;
    if (tl) { tl.progress(1); tl = null; }
    const from = cur, s = slug(to), g = GEO[s] || GEO.noema, inS = slides[to], outS = slides[from], inC = copies[to], outC = copies[from];
    cur = to; setUi(to); play(from, false); play(to, true);
    if (pulse && !reduce) firePulse(pulse, { w: 1000, h: 28, amp: 9, duration: 1.2 });
    const letters = Array.from(inC.querySelectorAll<HTMLElement>(".ex-l")), details = Array.from(inC.querySelectorAll<HTMLElement>(".ex-d"));
    inS.style.visibility = "visible"; inS.style.zIndex = String(++z); inC.style.visibility = "visible"; inC.style.zIndex = String(z + 1);
    if (immediate || reduce) { slides.forEach((x, k) => { x.style.visibility = k === to ? "visible" : "hidden"; }); copies.forEach((x, k) => { x.style.visibility = k === to ? "visible" : "hidden"; }); gsap.set(letters, { opacity: 1, clearProps: "transform" }); return; }
    tl = gsap.timeline({ onComplete: () => { outS.style.visibility = "hidden"; outC.style.visibility = "hidden"; gsap.set(inS, { clearProps: "clipPath,opacity" }); tl = null; } });
    if (g.opacity) tl.fromTo(inS, { opacity: 0 }, { opacity: 1, duration: DUR.xl, ease: EASE.breath }, 0);
    else tl.fromTo(inS, { clipPath: g.from }, { clipPath: g.to, duration: DUR.xl, ease: EASE.pass }, 0);
    tl.fromTo(inS.querySelector(".ex-media"), { scale: 1.12 }, { scale: 1, duration: DUR.xxl, ease: EASE.settle }, 0)
      .to(outC, { opacity: 0, duration: DUR.sm, ease: EASE.exit }, 0).set(outC, { opacity: 1 }, DUR.xl)
      .fromTo(inC, { opacity: 0 }, { opacity: 1, duration: DUR.sm, ease: EASE.settle }, 0.35)
      .fromTo(details, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: DUR.lg, ease: EASE.settle, stagger: 0.08 }, 0.7);
    titleIn(s, letters, tl, 0.45);
  };

  /* input */
  const onTab = (i: number) => () => go(i);
  const tabH = tabs.map((t, i) => { const h = onTab(i); t.addEventListener("click", h); return [t, h] as const; });
  const onKey = (e: KeyboardEvent) => { if (["ArrowRight", "ArrowDown"].includes(e.key)) { e.preventDefault(); go(cur + 1); tabs[cur].focus(); } else if (["ArrowLeft", "ArrowUp"].includes(e.key)) { e.preventDefault(); go(cur - 1); tabs[cur].focus(); } };
  root.addEventListener("keydown", onKey);
  let x0 = 0, y0 = 0, t0 = 0;
  const down = (e: PointerEvent) => { x0 = e.clientX; y0 = e.clientY; t0 = performance.now(); };
  const up = (e: PointerEvent) => { const dx = e.clientX - x0, dy = e.clientY - y0; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4 && performance.now() - t0 < 700) go(cur + (dx < 0 ? 1 : -1)); };
  root.addEventListener("pointerdown", down); root.addEventListener("pointerup", up);

  /* start: the hash picks the room (/experiences/#xoxo); the film of the first room plays when the stage is near */
  const h = location.hash.replace("#", ""); const hi = tabs.findIndex((t) => t.id === "ex-tab-" + h);
  setUi(0); slides.forEach((x, k) => { x.style.visibility = k === 0 ? "visible" : "hidden"; }); copies.forEach((x, k) => { x.style.visibility = k === 0 ? "visible" : "hidden"; });
  if (hi > 0) go(hi, true); else if (!reduce) { const tl0 = gsap.timeline(); titleIn(slug(0), Array.from(copies[0].querySelectorAll<HTMLElement>(".ex-l")), tl0, 0.2); }
  const io = new IntersectionObserver((es) => es.forEach((e) => play(cur, e.isIntersecting)), { rootMargin: "20% 0px" }); io.observe(root);

  return () => { tl?.kill(); io.disconnect(); tabH.forEach(([t, hh]) => t.removeEventListener("click", hh)); root.removeEventListener("keydown", onKey); root.removeEventListener("pointerdown", down); root.removeEventListener("pointerup", up); vids.forEach((v) => v?.pause()); };
}
