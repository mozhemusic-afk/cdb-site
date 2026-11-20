"use client";
import { useState } from "react";
import { disciplines } from "@/lib/disciplines";
import { Pulse } from "./Pulse";

/* "Built from sound", without needing sound: the eight layers of a night as the eight channels of a desk. Each channel carries its own
   line. They answer in a cascade when the section is first seen; pointing at (or tapping, or focusing) a channel solos it: its line takes
   a stronger beat, the others step back and its sentence appears. Every channel is a real button (aria-pressed); reduced motion gets
   static lines. */
const AMP = [10, 16, 12, 18, 11, 15, 9, 13];
export function LayerMixer() {
  const [solo, setSolo] = useState<number | null>(null);
  const [beat, setBeat] = useState(0);
  const pick = (i: number | null) => { setSolo(i); if (i !== null) setBeat((b) => b + 1); };
  return (
    <section id="layers" aria-label="One studio, every layer of the night" className="border-t border-bone/10 py-20 md:py-32">
      <div className="gx mb-10 grid gap-6 md:mb-16 md:grid-cols-12">
        <p className="label md:col-span-7">One studio · every layer of the night</p>
        <p className="max-w-sm text-ash md:col-span-4 md:col-start-9" aria-live="polite">{solo === null ? "Eight layers, one team. Point at a channel." : disciplines[solo].line}</p>
      </div>
      <ul className="gx" onPointerLeave={(e) => { if (e.pointerType === "mouse") pick(null); }} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) pick(null); }}>
        {disciplines.map((d, i) => (
          <li key={d.id} className="border-t border-bone/15 last:border-b" style={{ opacity: solo === null || solo === i ? 1 : 0.32, transition: "opacity var(--dur-md) var(--ease-settle)" }}>
            <button type="button" aria-pressed={solo === i} onMouseEnter={() => pick(i)} onFocus={() => pick(i)} onClick={() => pick(i)}
              className="grid w-full grid-cols-[auto_1fr] items-end gap-x-5 gap-y-1 py-4 text-left md:grid-cols-[5rem_1fr_minmax(0,32rem)] md:items-center md:py-6">
              <span className="label tabnum !text-bone">Ch {String(i + 1).padStart(2, "0")}</span>
              <span className="disp-c text-[clamp(2.4rem,8.4vw,8rem)] !leading-[.9]" style={{ color: solo === i ? "var(--bone, #ece8e1)" : undefined }}>{d.name}</span>
              <span className="col-span-2 text-bone/55 md:col-span-1" aria-hidden="true"><Pulse amp={AMP[i]} height={34} fireKey={solo === i ? beat : -1} className="" /></span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
