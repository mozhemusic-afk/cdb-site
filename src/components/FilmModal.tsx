"use client";
import { useEffect, useRef, useState } from "react";
import { Pulse } from "./Pulse";
import { DUR } from "@/lib/motion-tokens";
import type { Film } from "@/lib/films";

/* Full film in an accessible dialog: Escape closes, Tab stays inside, focus returns to the trigger, scrolling is paused. It opens muted with a
   poster; sound is turned on by the viewer. CDB controls (play/pause, seek, sound, full screen) replace the native bar. Enter/exit are CSS
   transitions on the shared tokens (opacity + transform only). */
export function FilmModal() {
  const [film, setFilm] = useState<Film | null>(null);
  const [shown, setShown] = useState(false);
  const [muted, setMuted] = useState(true);
  const [fs, setFs] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState({ t: 0, d: 0 });
  const trigger = useRef<HTMLElement | null>(null);
  const close = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const hide = () => { setShown(false); clearTimeout(timer.current); timer.current = setTimeout(() => setFilm(null), DUR.md * 1000); };

  useEffect(() => {
    const on = (e: Event) => {
      clearTimeout(timer.current);
      trigger.current = document.activeElement as HTMLElement;
      setMuted(true); setPlaying(false); setProg({ t: 0, d: 0 });
      setFilm((e as CustomEvent<Film>).detail);
      requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    };
    addEventListener("cdb:film", on);
    return () => { removeEventListener("cdb:film", on); clearTimeout(timer.current); };
  }, []);

  useEffect(() => {
    if (!film) { window.__lenis?.start(); document.documentElement.style.overflow = ""; trigger.current?.focus?.({ preventScroll: true }); return; }
    window.__lenis?.stop(); document.documentElement.style.overflow = "hidden";
    close.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { hide(); return; }
      if (e.key !== "Tab" || !box.current) return;
      const f = box.current.querySelectorAll<HTMLElement>("button,input"), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [film]);

  useEffect(() => { const on = () => setFs(!!document.fullscreenElement); document.addEventListener("fullscreenchange", on); return () => document.removeEventListener("fullscreenchange", on); }, []);
  const toggleFs = () => { const el = vid.current; if (!el) return; if (document.fullscreenElement) document.exitFullscreen?.(); else (el.requestFullscreen?.() ?? (el as unknown as { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen?.()); };
  const togglePlay = () => { const v = vid.current; if (!v) return; if (v.paused) v.play().catch(() => {}); else v.pause(); };
  const seek = (f: number) => { const v = vid.current; if (v && prog.d) v.currentTime = f * prog.d; };
  const fmt = (n: number) => `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}`;

  if (!film) return null;
  const t = (p: string, d: number, delay = 0) => `${p} ${d}s var(--ease-settle) ${delay}s`;
  return (
    <div ref={box} role="dialog" aria-modal="true" aria-label={film.title} className="fixed inset-0 z-[480] flex flex-col bg-ink/95" style={{ opacity: shown ? 1 : 0, transition: t("opacity", DUR.md) }} onClick={(e) => e.target === e.currentTarget && hide()}>
      <div className="gx flex items-center justify-between py-5">
        <p className="label !text-bone">{film.title}</p>
        <div className="flex items-center gap-6">
          <button type="button" className="label ulink !text-bone" aria-pressed={!muted} onClick={() => setMuted((m) => !m)}>{muted ? "Sound on" : "Sound off"}</button>
          <button type="button" className="label ulink !text-bone" onClick={toggleFs}>{fs ? "Exit full screen" : "Full screen"}</button>
          <button ref={close} type="button" className="label ulink !text-bone" onClick={hide}>Close ✕</button>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-[var(--gx)] pb-8" onClick={(e) => e.target === e.currentTarget && hide()}>
        <video ref={vid} src={film.src} poster={film.src.replace(/\.mp4$/, ".webp")} autoPlay muted={muted} playsInline preload="metadata" onClick={togglePlay} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setProg({ t: e.currentTarget.currentTime, d: e.currentTarget.duration || 0 })} onLoadedMetadata={(e) => setProg({ t: 0, d: e.currentTarget.duration || 0 })}
          className="max-h-[78vh] w-full max-w-[1500px] bg-black" style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : "scale(.96)", transition: `${t("opacity", DUR.lg, DUR.xs)}, ${t("transform", DUR.lg, DUR.xs)}` }} />
      </div>
      <div className="gx pb-6" role="group" aria-label="Film controls">
        <Pulse fireKey={playing ? 1 : 0} once={false} amp={8} height={24} className="text-bone/60" />
        <div className="mt-2 flex items-center gap-5">
          <button type="button" className="label ulink !text-bone w-14 text-left" onClick={togglePlay} aria-label={playing ? "Pause film" : "Play film"}>{playing ? "Pause" : "Play"}</button>
          <input type="range" min={0} max={1000} step={1} value={prog.d ? Math.round((prog.t / prog.d) * 1000) : 0} onChange={(e) => seek(+e.target.value / 1000)} aria-label="Seek" aria-valuetext={`${fmt(prog.t)} of ${fmt(prog.d)}`} className="film-seek min-h-11 flex-1" />
          <span className="label tabnum !text-bone w-24 text-right">{fmt(prog.t)} / {fmt(prog.d)}</span>
        </div>
      </div>
    </div>
  );
}
