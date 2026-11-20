"use client";
/* The opening and the film cycle of the home page. The headline rises by CSS (so it paints with no JavaScript in between); this module runs the
   Pulse beat across the dimmed poster, opens the frame, plays the films and hands the scene over to the next on scroll. */
import { gsap, ScrollTrigger, EASE, reducedMotion, isMobile, finePointer } from "@/lib/gsap";
import { DUR } from "@/lib/motion-tokens";
import { firePulse } from "@/lib/pulse";
import { FRAME, HERO, HOLD } from "@/lib/hero";

export function hero(): () => void {
  const root = document.getElementById("introduction"); if (!root) return () => {};
  const q = <T extends Element = HTMLElement>(s: string) => Array.from(root.querySelectorAll<T>(s));
  const one = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s);
  const vids = q<HTMLVideoElement>(".hero-film video"); if (vids.length < 2) return () => {};
  const docEl = document.documentElement;
  const saver = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  const src = (i: number) => (isMobile() ? HERO[i].mobile : HERO[i].src);
  const caption = one("p.label.truncate"), count = one("p.tabnum"), btn = one<HTMLButtonElement>(".hero-bar button");
  const segs = q(".hero-bar .bg-signal"), skip = one<HTMLButtonElement>(".hero-skip");
  const state = { cur: 0, layer: 0, busy: false, paused: false, started: false, timer: 0 as unknown as ReturnType<typeof setTimeout> };
  const owned = [".hero-zoom", ".hero-film", ".hero-open", ".hero-fade", ".hero-rule", ".hero-echo", ".hero-echo-line > span", ".hero-sub-w > span", ".hero-base", ".hero-curtain"].flatMap((s) => q(s));

  docEl.dataset.intro ||= "";
  if (reducedMotion() || saver) { docEl.dataset.intro = "seen"; q(".hero-base").forEach((e) => (e.style.display = "none")); gsap.set(q(".hero-fade, .hero-rule, .hero-echo-line > span, .hero-sub-w > span"), { opacity: 1, yPercent: 0, scaleX: 1 }); return () => {}; }

  const setBar = (idx: number) => { segs.forEach((s, i) => { s.style.animation = ""; s.style.transform = i < idx ? "scaleX(1)" : "scaleX(0)"; });
    const s = segs[idx]; if (s && !state.paused) { void s.offsetWidth; s.style.animation = `bar ${HOLD + 2}s linear forwards`; } };
  const setLabel = (i: number) => { if (caption) caption.innerHTML = `${HERO[i].exp} <span class="text-ash">· ${HERO[i].venue}</span>`; if (count) count.textContent = `${String(i + 1).padStart(2, "0")} / ${String(HERO.length).padStart(2, "0")}`; setBar(i); };

  const schedule = (fn: () => void) => { clearTimeout(state.timer); if (state.paused || document.hidden) return; state.timer = setTimeout(fn, HOLD * 1000); };
  const goTo = (n?: number) => {
    const s = state; if (s.busy) return; const next = n ?? (s.cur + 1) % HERO.length; s.busy = true;
    const from = vids[s.layer], to = vids[1 - s.layer];
    to.src = src(next); to.load();
    let ran = false;
    const run = () => {
      if (ran) return; ran = true; to.play().catch(() => {});
      const slit = next % 2 ? "inset(0% 50% 0% 50%)" : "inset(50% 0% 50% 0%)";   // a horizontal shutter, then a vertical one
      gsap.set(to, { opacity: 1, scale: 1.08, zIndex: 2, clipPath: slit }); gsap.set(from, { zIndex: 1 });
      gsap.timeline({ onComplete: () => { from.pause(); gsap.set(to, { clearProps: "scale,clipPath" }); gsap.set(from, { opacity: 0 }); s.layer = 1 - s.layer; s.cur = next; s.busy = false; setLabel(next); schedule(goTo); } })
        .to(caption, { opacity: 0, y: 8, duration: DUR.md, ease: EASE.settle }, 0)
        .to(from, { scale: 1.02, duration: DUR.xxl, ease: EASE.breath }, 0)
        .to(".hero-xdim", { opacity: 0.35, duration: DUR.lg, ease: EASE.breath, yoyo: true, repeat: 1 }, 0)
        .to(to, { clipPath: "inset(0% 0% 0% 0%)", duration: DUR.xl, ease: EASE.pass }, 0.1)
        .to(to, { scale: 1, duration: DUR.epic, ease: EASE.settle }, 0.1)
        .call(() => setLabel(next), [], 1.4)
        .to(caption, { opacity: 1, y: 0, duration: DUR.lg, ease: EASE.settle }, 1.6);
    };
    to.addEventListener("canplay", run, { once: true }); setTimeout(run, 2200);
  };

  /* start: first film after the page has loaded (the poster carries the first paint) */
  const first = vids[0]; first.addEventListener("playing", () => gsap.to(first, { opacity: 1, duration: DUR.xl, ease: EASE.settle }), { once: true });
  const startFirst = () => { first.src = src(0); first.load(); first.play().catch(() => {}); };
  let startT: ReturnType<typeof setTimeout> | undefined;
  const onLoad = () => { startT = setTimeout(startFirst, 250); };
  if (document.readyState === "complete") onLoad(); else addEventListener("load", onLoad, { once: true });

  const repeat = docEl.dataset.intro === "seen";
  gsap.set(q(".hero-echo-line > span"), { yPercent: 112, opacity: 1 }); gsap.set(q(".hero-sub-w > span"), { yPercent: 110, opacity: 1 });
  gsap.set(q(".hero-echo"), { xPercent: 1.6, yPercent: 7 }); gsap.set(q(".hero-fade"), { opacity: 0 }); gsap.set(q(".hero-rule"), { scaleX: 0, opacity: 1 });
  gsap.set(q(".hero-zoom"), { scale: 1.22, clipPath: "inset(34% 0% 34% 0%)" }); gsap.set(q(".hero-open"), { opacity: 0.55 });

  const finish = () => {
    if (state.started) return; state.started = true;
    docEl.dataset.intro = "seen"; docEl.classList.remove("intro-on"); window.__lenis?.start(); window.__intro = "done";
    window.dispatchEvent(new Event("cdb:intro-done")); schedule(goTo);
  };
  window.__intro = "running";
  if (!repeat) { docEl.classList.add("intro-on"); window.__lenis?.stop(); try { sessionStorage.setItem("cdb-intro", "1"); } catch {} }
  const failsafe = setTimeout(() => { gsap.set(q(".hero-curtain"), { autoAlpha: 0 }); finish(); }, 12000);

  const tl = gsap.timeline({ defaults: { ease: EASE.settle }, onComplete: () => { clearTimeout(failsafe); finish(); } });
  const curtain = one(".hero-curtain"), pulsePath = one<SVGPathElement>(".hero-pulse path");
  if (!repeat && pulsePath) {
    /* the opening is the pulse: a hairline takes one beat across the dimmed poster and lifts the headline lines as it passes */
    const lines = q(".hero-title .hero-line");
    firePulse(pulsePath, { w: 1000, h: 80, amp: 34, duration: 1.0, delay: 0.05, onFrame: (c) => lines.forEach((ln, i) => { const u = (c - (0.22 + i * 0.12)) / 0.1; gsap.set(ln, { y: c > 1.5 ? 0 : -(isMobile() ? 9 : 14) * Math.exp(-u * u) * Math.cos(u * 1.6) }); }) });
    tl.to(curtain, { opacity: 0, duration: DUR.md, ease: EASE.pass }, 0.85).set(curtain, { autoAlpha: 0 }, 1.6);
  }
  const t0 = repeat ? 0 : 0.5;
  tl.to(q(".hero-zoom"), { clipPath: "inset(0% 0% 0% 0%)", duration: DUR.xl, ease: EASE.pass, onComplete: () => { gsap.set(q(".hero-zoom"), { clearProps: "clipPath" }); } }, t0)
    .to(q(".hero-zoom"), { scale: 1, duration: repeat ? DUR.xxl : DUR.epic + 1, ease: EASE.settle }, t0)
    .to(q(".hero-base"), { autoAlpha: 0, duration: DUR.lg, ease: EASE.breath }, t0 + DUR.xl)
    .to(q(".hero-open"), { opacity: 0, duration: repeat ? DUR.xl : DUR.xxl, ease: EASE.breath }, t0)
    .to(q(".hero-echo-line > span"), { yPercent: 0, duration: DUR.xl, ease: EASE.settle, stagger: 0.16 }, t0 + 0.85)
    .to(q(".hero-rule"), { scaleX: 1, duration: DUR.xl, ease: EASE.pass }, t0 + 1.1)
    .to(q(".hero-sub-w > span"), { yPercent: 0, duration: DUR.lg, ease: EASE.settle, stagger: 0.09 }, t0 + 1.3)
    .to(q(".hero-fade"), { opacity: 1, duration: DUR.xl, ease: EASE.settle, stagger: 0.2 }, t0 + 2)
    .call(finish, [], t0 + 1.3);

  /* any input skips ahead: the sequence is a welcome, never a gate */
  const doSkip = () => { tl.progress(1); finish(); };
  const evs = ["keydown", "wheel", "touchstart", "pointerdown"] as const; evs.forEach((e) => addEventListener(e, doSkip, { once: true, passive: true }));
  addEventListener("cdb:skip-intro", doSkip); skip?.addEventListener("click", doSkip);

  /* scrolling: the copy leaves, the film closes to the shared window; the philosophy scene takes over on exactly that frame */
  const win = isMobile() ? FRAME.mobile : FRAME.desktop;
  const sc = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.5 } })
    .to(".hero-copy", { yPercent: -8, opacity: 0, duration: 0.45 }, 0).to(".hero-echo", { yPercent: -26, duration: 0.8 }, 0)
    .to(".hero-cue, .hero-bar", { opacity: 0, duration: 0.25 }, 0)
    .fromTo(".hero-zoom", { clipPath: FRAME.open }, { clipPath: win, duration: 1, immediateRender: false }, 0).to(".hero-film", { scale: 1.16, duration: 1 }, 0);

  /* pointer depth (desktop mouse only) */
  let unlean = () => {};
  if (finePointer()) {
    const ex = gsap.quickTo(".hero-echo", "x", { duration: DUR.xl, ease: EASE.settle }), ey = gsap.quickTo(".hero-echo", "y", { duration: DUR.xl, ease: EASE.settle }), tx = gsap.quickTo(".hero-title", "x", { duration: DUR.xl, ease: EASE.settle });
    const mv = (e: PointerEvent) => { const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5; tx(nx * -10); ex(nx * 14); ey(ny * 8); };
    root.addEventListener("pointermove", mv, { passive: true }); unlean = () => root.removeEventListener("pointermove", mv);
  }

  /* pause / play, visibility */
  const toggle = () => { state.paused = !state.paused; btn!.setAttribute("aria-pressed", String(state.paused)); btn!.textContent = state.paused ? "Play" : "Pause"; btn!.setAttribute("aria-label", state.paused ? "Play background films" : "Pause background films");
    const v = vids[state.layer]; if (state.paused) { clearTimeout(state.timer); v.pause(); setBar(state.cur); segs[state.cur] && (segs[state.cur].style.animation = ""); } else { v.play().catch(() => {}); setBar(state.cur); schedule(goTo); } };
  btn?.addEventListener("click", toggle);
  const io = new IntersectionObserver((es) => es.forEach((e) => { const v = vids[state.layer]; if (e.isIntersecting) { if (!state.paused) v.play().catch(() => {}); schedule(goTo); } else { v.pause(); clearTimeout(state.timer); } }), { threshold: 0.1 });
  io.observe(root);
  const vis = () => { if (document.hidden) { clearTimeout(state.timer); vids[state.layer].pause(); } else if (!state.paused) { vids[state.layer].play().catch(() => {}); schedule(goTo); } };
  document.addEventListener("visibilitychange", vis);
  setLabel(0);

  return () => {
    clearTimeout(startT); clearTimeout(state.timer); clearTimeout(failsafe); removeEventListener("load", onLoad); unlean(); tl.kill(); sc.scrollTrigger?.kill(); sc.kill();
    evs.forEach((e) => removeEventListener(e, doSkip)); removeEventListener("cdb:skip-intro", doSkip); skip?.removeEventListener("click", doSkip); btn?.removeEventListener("click", toggle);
    io.disconnect(); document.removeEventListener("visibilitychange", vis); gsap.killTweensOf(owned); ScrollTrigger.refresh();
  };
}
