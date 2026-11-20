"use client";
import { useEffect, useState, type ComponentType } from "react";

/* Behaviours that are not needed for the first paint (inertial scroll, film dialog, Night Flow) load after the page has loaded and the browser is
   idle, or at the first touch/key/pointer, whichever is first. A film requested earlier is replayed once the dialog is ready. */
type Parts = { SmoothScroll: ComponentType; FilmModal: ComponentType; NightFlow: ComponentType };
export function Deferred() {
  const [P, setP] = useState<Parts | null>(null);
  useEffect(() => {
    let done = false, pending: unknown = null;
    const early = (e: Event) => { pending = (e as CustomEvent).detail; go(); };
    addEventListener("cdb:film", early);
    const go = () => {
      if (done) return; done = true;
      Promise.all([import("./SmoothScroll"), import("./FilmModal"), import("./NightFlow")]).then(([a, b, c]) => {
        removeEventListener("cdb:film", early);
        setP({ SmoothScroll: a.SmoothScroll, FilmModal: b.FilmModal, NightFlow: c.NightFlow });
        if (pending) setTimeout(() => window.dispatchEvent(new CustomEvent("cdb:film", { detail: pending })), 60);
      });
    };
    const idle = () => ("requestIdleCallback" in window ? (window as unknown as { requestIdleCallback: (f: () => void, o: { timeout: number }) => void }).requestIdleCallback(go, { timeout: 1200 }) : void setTimeout(go, 600));
    const ev = ["pointerdown", "keydown", "touchstart", "wheel"] as const;
    ev.forEach((e) => addEventListener(e, go, { once: true, passive: true }));
    if (document.readyState === "complete") idle(); else addEventListener("load", idle, { once: true });
    return () => { removeEventListener("cdb:film", early); ev.forEach((e) => removeEventListener(e, go)); removeEventListener("load", idle); };
  }, []);
  if (!P) return null;
  return <><P.SmoothScroll /><P.FilmModal /><P.NightFlow /></>;
}
