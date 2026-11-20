/* The full films, by project. Played in the film dialog (muted until the viewer turns sound on). */
export type Film = { src: string; title: string };
export const FILMS: Record<string, Film> = {
  "cullinan-belek": { src: "/media/v5/film-noema-2026.mp4", title: "NOEMA · Cullinan Belek" },
  "voyage-belek": { src: "/media/v5/film-xoxo-2026-08.mp4", title: "XOXO · Voyage Belek" },
  "ng-phaselis-bay": { src: "/media/v5/film-trem-bala.mp4", title: "HYPNOTIZED · NG Phaselis Bay" },
  "titanic-belek": { src: "/media/v5/film-dinner-yamas.mp4", title: "Dinner show · Titanic Belek" },
};
/* the experience pages show the film of the production staged at their hotel */
export const EXP_FILM: Record<string, string> = { noema: "cullinan-belek", xoxo: "voyage-belek", hypnotized: "ng-phaselis-bay" };
export const openFilm = (f: Film) => window.dispatchEvent(new CustomEvent<Film>("cdb:film", { detail: f }));
