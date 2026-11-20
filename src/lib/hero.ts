/* The films of the opening, in order. Posters are the file name with .webp. The first is the opening edit; the others cycle after it. */
export type HeroFilm = { exp: string; venue: string; src: string; mobile: string };
export const HERO: HeroFilm[] = [
  { exp: "NOEMA × HYPNOTIZED", venue: "Cullinan Belek · Voyage Belek", src: "/media/v6/hero-open.mp4", mobile: "/media/v6/hero-open-m.mp4" },
  { exp: "NOEMA", venue: "Cullinan Belek", src: "/media/v6/hero-noema.mp4", mobile: "/media/v6/hero-noema-m.mp4" },
  { exp: "HYPNOTIZED", venue: "Voyage Belek", src: "/media/v6/hero-hypnotized.mp4", mobile: "/media/v6/hero-hypnotized-m.mp4" },
  { exp: "XOXO", venue: "Voyage Belek", src: "/media/v6/hero-xoxo.mp4", mobile: "/media/v6/hero-xoxo-m.mp4" },
  { exp: "Dinner Show", venue: "Yamas · Titanic Belek", src: "/media/v5/hero-dinner.mp4", mobile: "/media/v5/hero-dinner-m.mp4" },
];
export const HOLD = 11; // seconds each film stays before the next one dissolves in
/* the window the hero closes into and the philosophy scene opens from: a match cut on the same frame */
export const FRAME = { open: "inset(0% 0% 0% 0%)", desktop: "inset(16% 27% 16% 27%)", mobile: "inset(18% 9% 18% 9%)" };
