"use client";
/* The philosophy scene: a sticky stage that takes over on exactly the frame the opening closed into (the window opens to full bleed), the headline
   hands over to the sentence whose words light as they are read, and a second film drifts through at another depth. */
import { gsap, ScrollTrigger, reducedMotion, isMobile } from "@/lib/gsap";
import { FRAME } from "@/lib/hero";

const FILM = { src: "/media/v5/costume-shoot-preview", aside: "/media/v5/live-2026-07-b-preview" };
const filmDom = (base: string) => `<div class="film absolute inset-0"><img src="${base}.webp" alt="" loading="lazy" decoding="async" /><video muted loop playsinline preload="none" aria-hidden="true" tabindex="-1"></video></div>`;

export function philosophy(): () => void {
  const sec = document.getElementById("philosophy"); if (!sec) return () => {};
  const q = (s: string) => Array.from(sec.querySelectorAll<HTMLElement>(s));
  const filmBox = sec.querySelector<HTMLElement>(".ph-film"), aside = sec.querySelector<HTMLElement>(".ph-aside");
  const inject = () => { if (filmBox && !filmBox.firstChild) filmBox.innerHTML = filmDom(FILM.src); if (aside && !aside.firstChild) aside.innerHTML = filmDom(FILM.aside); window.dispatchEvent(new Event("cdb:films")); };
  /* the footage is requested only after the scene is 30% into view, never on first paint of the home page */
  const near = ScrollTrigger.create({ trigger: sec, start: "top 70%", once: true, onEnter: inject });
  if (reducedMotion()) { inject(); gsap.set(q(".ph-word"), { opacity: 1 }); return () => near.kill(); }
  const win = isMobile() ? FRAME.mobile : FRAME.desktop;
  gsap.set(q(".ph-win"), { clipPath: win }); gsap.set(q(".ph-word"), { opacity: 0.18 }); gsap.set(q(".ph-b"), { opacity: 0 }); gsap.set(aside, { opacity: 0, y: 40 });
  const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.6 } })
    .to(".ph-win", { clipPath: FRAME.open, duration: 0.3 }, 0)
    .fromTo(".ph-film", { scale: 1.2 }, { scale: 1, duration: 1 }, 0)
    .to(".ph-shade", { opacity: 0.55, duration: 0.25 }, 0.2)
    .to(".ph-a", { opacity: 0, yPercent: -6, duration: 0.12 }, 0.34)
    .to(".ph-b", { opacity: 1, duration: 0.1 }, 0.4)
    .to(q(".ph-word"), { opacity: 1, duration: 0.04, stagger: 0.016 }, 0.44)
    .to(aside, { opacity: 1, y: 0, duration: 0.2 }, 0.55);
  return () => { near.kill(); tl.scrollTrigger?.kill(); tl.kill(); };
}
