/* The four emotional phases of the night. They are internal: never printed as headings. Each phase sets the tempo (on a 0.6 s beat grid:
   6.0 s = 10 beats, 3.6 s = 6, 1.8 s = 3), the amplitude and colour of the Night Flow line and the ink tint of the page. */
export type Phase = "anticipation" | "connection" | "euphoria" | "afterglow";
export const BEAT = 0.6;
export const NIGHT: Record<Phase, { amp: number; every: number; dur: number; color: string; tint: string }> = {
  anticipation: { amp: 6, every: 6.0, dur: 1.9, color: "rgba(236,232,225,.5)", tint: "#0b0b0c" },
  connection: { amp: 11, every: 3.6, dur: 1.3, color: "rgba(201,139,90,.75)", tint: "#0d0a09" },
  euphoria: { amp: 20, every: 1.8, dur: 0.9, color: "rgba(224,100,112,.85)", tint: "#0e0a0b" },
  afterglow: { amp: 8, every: 0, dur: 2.6, color: "rgba(214,170,110,.65)", tint: "#0c0a08" },
};
/* Home: which section sits in which phase (by element id). Other routes take a base phase from the path. */
export const HOME_PHASES: [string, Phase][] = [
  ["introduction", "anticipation"], ["philosophy", "anticipation"], ["layers", "connection"], ["experiences", "euphoria"],
  ["work", "afterglow"], ["season", "afterglow"], ["venues", "afterglow"], ["invitation", "afterglow"],
];
export const phaseForPath = (p: string): Phase => {
  const s = p.split("/").filter(Boolean);
  if (s[0] === "experiences" && s[1]) return "euphoria";
  if (s[0] === "work" && s[1]) return "connection";
  if (s[0] === "studio") return "connection";
  if (s[0] === "work" || s[0] === "contact" || s[0] === "privacy") return "afterglow";
  return "anticipation";
};
