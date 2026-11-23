"use client";

import { Sun } from "lucide-react";

const LINKS = [
  { label: "Maré", href: "#mare" },
  { label: "Sol", href: "#sol" },
  { label: "Onda", href: "#onda" },
  { label: "Caleido", href: "#caleidoscopio" },
  { label: "Aurora", href: "#aurora" },
  { label: "Plâncton", href: "#plancton" },
  { label: "Cor", href: "#cor" },
  { label: "Digita", href: "#digita" },
] as const;

/** Floating minimal top bar — replaces the old navbar. Shows the live phase
 *  of the day-cycle so the scroll journey always knows what time it is. */
export function TopBar({ phase, time }: { phase: string; time: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div className="flex w-full max-w-3xl items-center justify-between gap-3 rounded-full border border-white/20 bg-[#04101f]/60 py-2 pr-2 pl-4 shadow-[0_10px_40px_rgba(2,7,15,0.45)] backdrop-blur-xl">
        <a href="#top" className="flex items-center gap-2 font-display text-sm font-bold tracking-[0.14em] text-white">
          <span className="flex size-8 items-center justify-center rounded-full bg-sun text-deep">
            <Sun className="size-4" aria-hidden="true" />
          </span>
          SOL &amp; MAR
        </a>
        <p className="hidden items-center gap-2 text-xs font-semibold tracking-[0.18em] text-sun uppercase sm:flex" aria-live="polite">
          <span className="inline-block size-2 animate-pulse rounded-full bg-sun" aria-hidden="true" />
          {phase} · {time}
        </p>
        <nav aria-label="Seções da viagem" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href="#onda"
          className="rounded-full bg-sun px-4 py-2 text-sm font-bold text-deep transition-transform hover:scale-105"
        >
          Mergulhar
        </a>
      </div>
    </header>
  );
}
