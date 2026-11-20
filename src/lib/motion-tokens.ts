/* One source of truth for time and movement (pure data). It feeds GSAP, CSS custom properties (injected in the layout) and the Night Flow.
   Beat grid for the music-led parts: 0.6 s (100 BPM). */
export const BEZIER = {
  settle: [0.16, 1, 0.3, 1], pass: [0.76, 0, 0.24, 1], breath: [0.37, 0, 0.63, 1], exit: [0.55, 0, 1, 0.45],
} as const;
export const DUR = { xs: 0.2, sm: 0.4, md: 0.7, lg: 1.1, xl: 1.6, xxl: 2.4, epic: 3.2 } as const;
export const STAGGER = { tight: 0.04, base: 0.08, loose: 0.14, letter: 0.06 } as const;
export const DIST = { sm: 12, md: 24, lg: 48, mask: 112 } as const;

const bz = (b: readonly number[]) => `cubic-bezier(${b.join(",")})`;
/* the :root custom properties the stylesheet reads (--ease-*, --dur-*) */
export const cssVars = () =>
  ":root{" +
  Object.entries(BEZIER).map(([k, v]) => `--ease-${k}:${bz(v)};`).join("") +
  "--dur-instant:10ms;" +
  Object.entries(DUR).map(([k, v]) => `--dur-${k}:${Math.round(v * 1000)}ms;`).join("") +
  "}";
