"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent } from "motion/react";
import { Palette, RotateCcw } from "lucide-react";
import type { Journey } from "@/lib/journey";

const TRIPS = [
  { label: "Pôr do Sol", hue: 0, desc: "o site como nasceu", bg: "linear-gradient(135deg,#ff6e28,#ffc93c,#4db2e8)" },
  { label: "Maré Neon", hue: 160, desc: "verde-água elétrico", bg: "linear-gradient(135deg,#0e5a8a,#2e9bff,#7cffb2)" },
  { label: "Ouro Líquido", hue: 40, desc: "tudo vira ouro", bg: "linear-gradient(135deg,#ff9f1c,#ffe98a,#ff6e28)" },
  { label: "Noite Elétrica", hue: 250, desc: "violeta profundo", bg: "linear-gradient(135deg,#2e1a6b,#7c5cff,#2e9bff)" },
] as const;

/** VIAGEM DE COR / HUE TRIP — o controle que muda o site INTEIRO. Um dial
 *  gigante que você gira, um slider, e 4 viagens de um toque. O matiz vive
 *  no journey.hue: o shader do oceano, as auroras, o plâncton e o resto da
 *  página (filtro hue-rotate no <main>) seguem o mesmo valor. */
export function HueTrip({ journey }: { journey: Journey }) {
  const dialRef = useRef<HTMLDivElement>(null);
  const hueNumRef = useRef<HTMLSpanElement>(null);
  const dragging = useRef(false);
  const [label, setLabel] = useState("Pôr do Sol");
  const [hueState, setHueState] = useState(0);

  useMotionValueEvent(journey.hue, "change", (v) => {
    const n = Math.round(v);
    if (hueNumRef.current) hueNumRef.current.textContent = `${n}°`;
    setHueState(n);
  });

  function hueFromEvent(e: React.PointerEvent) {
    const el = dialRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const angle = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
    journey.hue.set(Math.round(((angle + 90 + 360) % 360)));
    setLabel("Viagem livre");
  }

  function setTrip(hue: number, tripLabel: string) {
    journey.hue.set(hue);
    setLabel(tripLabel);
  }

  // keep the dial needle in sync without re-rendering every frame
  const needleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const unsub = journey.hue.on("change", (v) => {
      if (needleRef.current) needleRef.current.style.transform = `translate(-50%,-50%) rotate(${v}deg) translateY(-104px)`;
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="cor" aria-label="Viagem de cor — mude o matiz do site inteiro" className="relative z-10 px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-4 py-2 text-[11px] font-bold tracking-[0.28em] text-white/85 uppercase backdrop-blur">
            <Palette className="size-3.5 text-sun" aria-hidden="true" />
            Viagem de cor — Hue Trip
          </p>
          <h2 className="font-display text-[clamp(2.6rem,8vw,5.5rem)] leading-[0.9] font-bold tracking-tight text-white">
            GIRE O <span className="text-gradient-sun">MUNDO</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-white/75">
            Um giro muda a cor do site inteiro — o oceano, a aurora, o plâncton, tudo. Gire o dial ou escolha uma viagem.
          </p>
        </div>

        <div className="flex flex-col items-center gap-10 lg:flex-row lg:justify-center">
          {/* big drag dial */}
          <div
            ref={dialRef}
            role="slider"
            aria-label="Matiz do site inteiro"
            aria-valuemin={0}
            aria-valuemax={359}
            aria-valuenow={hueState}
            tabIndex={0}
            onKeyDown={(e) => {
              const step = e.shiftKey ? 30 : 5;
              if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                e.preventDefault();
                journey.hue.set((journey.hue.get() + step) % 360);
                setLabel("Viagem livre");
              }
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                e.preventDefault();
                journey.hue.set((journey.hue.get() - step + 360) % 360);
                setLabel("Viagem livre");
              }
            }}
            onPointerDown={(e) => {
              dragging.current = true;
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
              hueFromEvent(e);
            }}
            onPointerMove={(e) => {
              if (dragging.current) hueFromEvent(e);
            }}
            onPointerUp={() => (dragging.current = false)}
            onPointerCancel={() => (dragging.current = false)}
            className="relative size-[280px] shrink-0 cursor-grab touch-none rounded-full shadow-[0_0_80px_rgba(255,201,60,0.25)] outline-none active:cursor-grabbing sm:size-[320px]"
            style={{
              background:
                "conic-gradient(from 0deg,#ff2e63,#ff9f1c,#ffc93c,#7cffb2,#2e9bff,#7c5cff,#ff2e63)",
            }}
          >
            <div className="absolute inset-3 rounded-full bg-[#04101f]/85 backdrop-blur-sm" />
            {/* needle */}
            <div
              ref={needleRef}
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 size-4 rounded-full bg-sun shadow-[0_0_18px_rgba(255,201,60,0.9)]"
              style={{ transform: "translate(-50%,-50%) rotate(0deg) translateY(-104px)" }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span ref={hueNumRef} className="font-display text-6xl font-bold text-white tabular-nums">
                0°
              </span>
              <span className="mt-1 text-xs font-bold tracking-[0.25em] text-sun uppercase">{label}</span>
              <span className="mt-2 text-[11px] font-semibold tracking-[0.2em] text-white/60 uppercase">
                gire o dial
              </span>
            </div>
          </div>

          {/* presets + slider */}
          <div className="w-full max-w-md">
            <div className="grid grid-cols-2 gap-3">
              {TRIPS.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setTrip(t.hue, t.label)}
                  aria-pressed={label === t.label}
                  className={`rounded-3xl border p-4 text-left transition-all hover:scale-[1.03] ${
                    label === t.label
                      ? "border-sun bg-white/15 shadow-[0_0_30px_rgba(255,201,60,0.35)]"
                      : "border-white/15 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <span className="mb-3 block h-10 w-full rounded-2xl" style={{ background: t.bg }} aria-hidden="true" />
                  <span className="block text-base font-bold text-white">{t.label}</span>
                  <span className="block text-xs text-white/60">{t.desc}</span>
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur">
              <label htmlFor="hue-range" className="mb-3 flex items-center justify-between text-sm font-bold text-white">
                <span>Matiz fino</span>
                <span className="text-sun tabular-nums">{hueState}°</span>
              </label>
              <input
                id="hue-range"
                type="range"
                min={0}
                max={359}
                value={hueState}
                onChange={(e) => {
                  journey.hue.set(Number(e.target.value));
                  setLabel("Viagem livre");
                }}
                className="range-sun w-full"
              />
              <button
                type="button"
                onClick={() => setTrip(0, "Pôr do Sol")}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/20"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Voltar ao Pôr do Sol
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
