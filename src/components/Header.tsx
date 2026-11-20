"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "@/lib/gsap";
import { Logo } from "./Logo";

const NAV = [{ href: "/work/", label: "Work" }, { href: "/experiences/", label: "Experiences" }, { href: "/studio/", label: "Studio" }, { href: "/contact/", label: "Contact" }];
const ACTIVE = "[background-image:linear-gradient(var(--signal),var(--signal))] [background-size:100%_1px]";

/* Fixed header: hides while scrolling down, returns on the way up (one ScrollTrigger, no scroll listener); the mobile menu is a CSS clip-path wipe
   with masked links rising in sequence. Focus is trapped while the menu is open and Escape closes it. */
export function Header() {
  const path = usePathname();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const cur = (href: string) => path === href || path.startsWith(href);

  useEffect(() => {
    const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => setHidden(s.direction === 1 && s.scroll() > 140) });
    return () => st.kill();
  }, []);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden"; window.__lenis?.stop();
    closeBtn.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); menuBtn.current?.focus(); return; }
      if (e.key !== "Tab" || !panel.current) return;
      const f = panel.current.querySelectorAll<HTMLElement>("a,button"), a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    };
    addEventListener("keydown", key);
    return () => { removeEventListener("keydown", key); document.documentElement.style.overflow = ""; window.__lenis?.start(); };
  }, [open]);

  const links = [{ href: "/", label: "Home" }, ...NAV];
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] transition-transform duration-lg ease-pass" style={{ transform: hidden && !open ? "translateY(-110%)" : "none", background: "linear-gradient(180deg, rgba(11,11,12,.72), rgba(11,11,12,0))" }}>
        <div className="gx flex items-center justify-between py-5 md:py-6">
          <a href="/" aria-label="CDB Production home" data-magnetic="true"><Logo className="h-7 w-auto text-bone md:h-9" /></a>
          <nav aria-label="Primary" className="hidden items-center gap-10 md:flex">
            {NAV.map((n) => <a key={n.href} href={n.href} aria-current={cur(n.href) ? "page" : undefined} className={"label ulink !text-bone " + (cur(n.href) ? ACTIVE : "")}>{n.label}</a>)}
            <a className="btn !min-h-11 !px-5" data-magnetic="true" href="/contact/">Start a project <span aria-hidden="true">↗</span></a>
          </nav>
          <div className="flex items-center gap-5 md:hidden">
            <button ref={menuBtn} type="button" className="label !text-bone" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}>Menu</button>
          </div>
        </div>
      </header>
      <div ref={panel} id="mobile-menu" role="dialog" aria-modal={open} aria-label="Menu" aria-hidden={!open} inert={!open} className="fixed inset-0 z-[400] flex flex-col bg-ink md:hidden"
        style={{ clipPath: open ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)", visibility: open ? "visible" : "hidden", transition: `clip-path ${open ? 1.1 : 0.7}s var(--ease-pass), visibility 0s linear ${open ? 0 : 0.7}s` }}>
        <div className="gx flex items-center justify-between py-5">
          <Logo className="h-7 w-auto text-bone" />
          <button ref={closeBtn} type="button" className="label ulink !text-bone" onClick={() => setOpen(false)}>Close</button>
        </div>
        <nav aria-label="Mobile" className="gx flex flex-1 flex-col justify-center gap-1">
          {links.map((n, i) => (
            <div key={n.href} className="overflow-hidden">
              <div style={{ transform: open ? "none" : "translateY(110%)", transition: open ? `transform 1.1s var(--ease-settle) ${0.25 + i * 0.07}s` : "none" }}>
                <a href={n.href} onClick={() => setOpen(false)} aria-current={n.href !== "/" && cur(n.href) ? "page" : undefined} className="disp block text-[clamp(2.6rem,14vw,5rem)] leading-[1.02] tracking-[-0.045em] transition-opacity duration-sm ease-settle hover:opacity-60 focus-visible:opacity-60">{n.label}</a>
              </div>
            </div>
          ))}
        </nav>
        <div className="gx pb-8 pt-4"><a href="mailto:booking@cdbproduction.com" className="label !text-bone">booking@cdbproduction.com</a><p className="label mt-2">Antalya, Türkiye</p></div>
      </div>
    </>
  );
}
