"use client";
/* Any "Watch the film" button opens the dialog with the right film: its own article (home work list), the case page, or the experience page. */
import { EXP_FILM, FILMS, openFilm } from "@/lib/films";

export function filmButtons(path: string): () => void {
  const onClick = (e: MouseEvent) => {
    const b = (e.target as Element).closest<HTMLElement>('button[data-cursor="Play"]'); if (!b) return;
    const art = b.closest("article[aria-label]");
    let slug = "";
    if (art) { const a = art.querySelector<HTMLAnchorElement>('a[href^="/work/"]'); slug = a?.getAttribute("href")?.split("/")[2] || ""; }
    if (!slug) { const m = path.match(/^\/work\/([^/]+)\//); if (m) slug = m[1]; }
    if (!slug) { const m = path.match(/^\/experiences\/([^/]+)\//); if (m) slug = EXP_FILM[m[1]] || ""; }
    const f = FILMS[slug]; if (f) openFilm(f);
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}
