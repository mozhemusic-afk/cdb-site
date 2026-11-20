"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "@/lib/gsap";
import { films, reveals, stages, textAndMedia } from "./core";
import { hero } from "./hero";
import { philosophy } from "./philosophy";
import { contactForm } from "./contact";
import { selector } from "./selector";
import { filmButtons } from "./filmButtons";

/* Runs the generic behaviours after every route renders and refreshes the scroll triggers once layout has settled. */
export function Enhance() {
  const path = usePathname();
  useEffect(() => {
    const cleanups = [reveals(), textAndMedia(), stages(), films(), filmButtons(path), ...(path === "/" ? [hero(), philosophy()] : []), ...(path === "/contact/" ? [contactForm()] : []), ...(path === "/" || path === "/experiences/" ? [selector()] : [])];
    const t = setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => { clearTimeout(t); cleanups.forEach((c) => c()); };
  }, [path]);
  return null;
}
