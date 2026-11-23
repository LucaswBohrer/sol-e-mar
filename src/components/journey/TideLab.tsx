"use client";

import { useMotionValue, useMotionValueEvent, useSpring } from "motion/react";
import { useRef, useState } from "react";
import { ArrowDownUp, Waves } from "lucide-react";

/** MARÉ — full-screen sticky lab. Drag vertically (or use the slider) to
 *  raise and lower the tide: the water climbs over the type, the percentage
 *  and the light follow. Usable in 3 seconds, no instructions paragraph. */
export function TideLab() {
  const areaRef = useRef<HTMLDivElement>(null);
  const waterRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const dragging = useRef(false);

  const level = useMotionValue(0.45);
  const smooth = useSpring(level, { stiffness: 90, damping: 18, mass: 0.6 });
  const [levelState, setLevelState] = useState(45);

  useMotionValueEvent(smooth, "change", (v) => {
    if (waterRef.current) waterRef.current.style.height = `${Math.round(v * 100)}%`;
    if (wordRef.current) {
      wordRef.current.style.transform = `translateY(${v * 26}vh) scale(${1 - v * 0.12})`;
    }
    if (pctRef.current) pctRef.current.textContent = `${Math.round(v * 100)}%`;
    // keep the slider thumb in sync by direct DOM write — no React re-render
    if (rangeRef.current) rangeRef.current.value = String(Math.round(v * 100));
  });

  function setFromClientY(clientY: number) {
    const el = areaRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const v = Math.min(1, Math.max(0, 1 - (clientY - r.top) / r.height));
    level.set(v);
  }

  function commitLevel() {
    setLevelState(Math.round(smooth.get() * 100));
  }

  return (
    <section id="mare" aria-label="Maré — arraste para subir e descer a maré" className="relative z-10">
      <div
        ref={areaRef}
        className="sticky top-0 flex h-svh touch-none flex-col items-center justify-center overflow-hidden"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          setFromClientY(e.clientY);
        }}
        onPointerMove={(e) => {
          if (dragging.current) setFromClientY(e.clientY);
        }}
        onPointerUp={() => {
          dragging.current = false;
          commitLevel();
        }}
        onPointerCancel={() => {
          dragging.current = false;
          commitLevel();
        }}
      >
        {/* rising water */}
        <div
          ref={waterRef}
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#062a44] via-[#0e5a8a]/85 to-[#4db2e8]/40"
          style={{ height: "45%" }}
        >
          <svg
            aria-hidden="true"
            className="wave-drift absolute -top-[38px] left-0 h-[40px] w-[200%] text-[#4db2e8]/70"
            viewBox="0 0 1200 40"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,20 Q75,0 150,20 T300,20 T450,20 T600,20 T750,20 T900,20 T1050,20 T1200,20 L1200,40 L0,40 Z" />
          </svg>
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(255,201,60,0.25),transparent_70%)]" />
        </div>

        <div className="relative z-10 flex flex-col items-center px-5 text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-4 py-2 text-[11px] font-bold tracking-[0.28em] text-white/85 uppercase backdrop-blur">
            <Waves className="size-3.5 text-sun" aria-hidden="true" />
            Lab 01 — Maré
          </p>
          <div ref={wordRef} className="will-change-transform">
            <span aria-hidden="true" className="block font-display text-[clamp(4.5rem,20vw,15rem)] leading-[0.85] font-bold tracking-[-0.04em] text-white drop-shadow-[0_12px_50px_rgba(2,16,31,0.6)]">
              MARÉ
            </span>
          </div>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-white/80 sm:text-lg">
            Arraste para cima e para baixo. A água obedece — e cobre tudo.
          </p>
          <p className="mt-3 font-display text-6xl font-bold text-sun tabular-nums drop-shadow-[0_4px_24px_rgba(255,159,28,0.45)]">
            <span ref={pctRef}>45%</span>
          </p>
          <div className="mt-6 flex items-center gap-3">
            <ArrowDownUp className="size-5 animate-bounce text-white/70" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-[0.2em] text-white/60 uppercase">
              arraste na tela
            </span>
          </div>
        </div>

        {/* accessible control — same value, keyboard friendly */}
        <div className="absolute bottom-6 left-1/2 z-20 w-[min(420px,86vw)] -translate-x-1/2">
          <label htmlFor="tide-range" className="sr-only">
            Nível da maré — {levelState}%
          </label>
          <input
            id="tide-range"
            ref={rangeRef}
            type="range"
            min={0}
            max={100}
            defaultValue={45}
            onChange={(e) => {
              level.set(Number(e.target.value) / 100);
              setLevelState(Number(e.target.value));
            }}
            className="range-sun w-full"
          />
          <div className="mt-2 flex justify-between text-[11px] font-bold tracking-[0.2em] text-white/60 uppercase">
            <span>Maré baixa</span>
            <span>Maré alta</span>
          </div>
        </div>
      </div>
      {/* scroll room so the sticky lab has time to breathe */}
      <div aria-hidden="true" className="h-[90svh]" />
    </section>
  );
}
