"use client";
/* The proposal form: Netlify Forms (the static twin is /forms.html). Validation is explicit and kind: one status line, per-field messages,
   focus goes to the first problem, nothing typed is ever lost. Delivery is by fetch to /forms.html; real delivery needs a live Netlify check. */
import { firePulse, flatPulse } from "@/lib/pulse";
import { reducedMotion } from "@/lib/gsap";

const MSG: Record<string, string> = { contact_name: "Please tell us your name.", contact: "Enter a work email we can reply to.", city: "Where are you based?", kvkk: "Please confirm to continue." };

export function contactForm(): () => void {
  const form = document.querySelector<HTMLFormElement>('form[name="otel-teklif"]'); if (!form) return () => {};
  const status = form.querySelector<HTMLElement>("#form-status")!;
  const qs = new URLSearchParams(location.search);
  let landing = ""; try { landing = sessionStorage.getItem("cdb-landing") || ""; if (!landing) { landing = location.href; sessionStorage.setItem("cdb-landing", landing); } } catch { landing = location.href; }
  const set = (n: string, v: string) => { const e = form.elements.namedItem(n) as HTMLInputElement | null; if (e) e.value = v; };
  set("lead_page", location.pathname + location.search); set("landing_page", landing); set("referrer", document.referrer);
  set("utm_source", qs.get("utm_source") || ""); set("utm_medium", qs.get("utm_medium") || ""); set("utm_campaign", qs.get("utm_campaign") || "");

  /* interest chips: one at a time, toggled */
  const chips = Array.from(form.querySelectorAll<HTMLButtonElement>("fieldset button[aria-pressed]"));
  const ON = ["border-bone", "bg-bone", "text-ink"];
  const paint = (b: HTMLButtonElement, on: boolean) => { b.setAttribute("aria-pressed", String(on)); ON.forEach((c) => b.classList.toggle(c, on)); };
  const chipClick = (b: HTMLButtonElement) => () => { const on = b.getAttribute("aria-pressed") !== "true"; chips.forEach((c) => paint(c, false)); paint(b, on); set("interest", on ? (b.textContent || "").trim() : ""); };
  const chipHandlers = chips.map((b) => { const h = chipClick(b); b.addEventListener("click", h); return [b, h] as const; });

  const clearErr = (el: HTMLElement) => { el.removeAttribute("aria-invalid"); el.classList.remove("border-signal"); el.closest("label")?.querySelector(".fe")?.remove(); };
  const showErr = (el: HTMLElement, text: string) => {
    el.setAttribute("aria-invalid", "true"); el.classList.add("border-signal"); const lab = el.closest("label") || el.closest("div")!;
    if (!lab.querySelector(".fe")) { const s = document.createElement("span"); s.className = "fe mt-2 block text-sm text-signal"; s.textContent = text; lab.appendChild(s); }
  };
  const oninput = (e: Event) => { const t = e.target as HTMLElement; if (t.getAttribute("aria-invalid")) clearErr(t); };
  form.addEventListener("input", oninput);

  /* the Pulse crosses a field's underline when it gets focus */
  const focus = (e: FocusEvent) => {
    const t = e.target as HTMLElement; if (!/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName) || reducedMotion()) return;
    const lab = t.closest("label") as HTMLElement | null; if (!lab || t.getAttribute("type") === "checkbox") return;
    let svg = lab.querySelector<SVGSVGElement>("svg.fp");
    if (!svg) {
      lab.style.position = "relative";
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("class", "fp pointer-events-none absolute inset-x-0 bottom-0 translate-y-1/2 overflow-visible text-bone/70"); svg.setAttribute("viewBox", "0 0 1000 24"); svg.setAttribute("preserveAspectRatio", "none"); svg.setAttribute("aria-hidden", "true"); svg.style.height = "24px"; svg.style.width = "100%";
      const p = document.createElementNS("http://www.w3.org/2000/svg", "path"); p.setAttribute("fill", "none"); p.setAttribute("stroke", "currentColor"); p.setAttribute("stroke-width", "1"); p.setAttribute("vector-effect", "non-scaling-stroke"); p.setAttribute("d", flatPulse(1000, 24)); svg.appendChild(p); lab.appendChild(svg);
    }
    firePulse(svg.querySelector("path")!, { w: 1000, h: 24, amp: 9, duration: 0.9 });
  };
  form.addEventListener("focusin", focus);

  const onSubmit = async (ev: SubmitEvent) => {
    ev.preventDefault();
    const bad: HTMLElement[] = [];
    (["contact_name", "contact", "city"] as const).forEach((n) => { const el = form.elements.namedItem(n) as HTMLInputElement; clearErr(el); const v = el.value.trim(); if (!v || (n === "contact" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v))) { showErr(el, MSG[n]); bad.push(el); } });
    const k = form.elements.namedItem("kvkk") as HTMLInputElement; clearErr(k); if (!k.checked) { showErr(k, MSG.kvkk); bad.push(k); }
    if (bad.length) { status.textContent = `${bad.length} field${bad.length > 1 ? "s" : ""} need${bad.length > 1 ? "" : "s"} your attention.`; bad[0].focus(); return; }
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!; btn.disabled = true; status.textContent = "Sending…";
    try {
      const body = new URLSearchParams(new FormData(form) as unknown as Record<string, string>).toString();
      const r = await fetch("/forms.html", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
      if (!r.ok) throw new Error(String(r.status));
      form.innerHTML = `<div role="status" class="py-10"><p class="disp text-h2">Thank you.</p><p class="mt-6 max-w-md text-lg text-bone/80">Your request has been sent. We will reply to the email you gave us.</p></div>`;
    } catch {
      btn.disabled = false; status.textContent = "It did not send, and nothing was lost. Please try again, or write to booking@cdbproduction.com.";
    }
  };
  form.addEventListener("submit", onSubmit);
  return () => { chipHandlers.forEach(([b, h]) => b.removeEventListener("click", h)); form.removeEventListener("input", oninput); form.removeEventListener("focusin", focus); form.removeEventListener("submit", onSubmit); };
}
