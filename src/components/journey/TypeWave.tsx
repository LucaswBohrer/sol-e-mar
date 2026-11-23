"use client";

import { useEffect, useRef, useState } from "react";
import { Shuffle, Type } from "lucide-react";
import type { Journey } from "@/lib/journey";

const PRESETS = ["SOL", "MAR", "MARÉ", "ONDA", "LUZ", "VIAGEM"] as const;

/** DIGITA E VIRA ONDA — você digita qualquer palavra e ela vira uma onda
 *  viva: cada letra flutua como na água, foge do ponteiro e pulsa com a
 *  velocidade do scroll. */
export function TypeWave({ journey }: { journey: Journey }) {
  const [word, setWord] = useState("MARÉ");
  const charsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const pointerRef = useRef({ x: -999, y: -999 });
  const stageRef = useRef<HTMLDivElement>(null);

  const letters = word.toUpperCase().slice(0, 14).split("");

  useEffect(() => {
    function onMove(e: PointerEvent) {
      pointerRef.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const start = performance.now();
    function frame(now: number) {
      const t = (now - start) / 1000;
      const vel = Math.min(3, Math.abs(journey.velocity.get()) / 400);
      const amp = 8 + vel * 22;
      charsRef.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = cx - pointerRef.current.x;
        const dy = cy - pointerRef.current.y;
        const d2 = dx * dx + dy * dy;
        let lift = 0;
        if (d2 < 160 * 160 && d2 > 0.01) {
          lift = ((160 - Math.sqrt(d2)) / 160) * 34;
        }
        const y = Math.sin(t * 2.1 + i * 0.65) * amp - lift;
        const rot = Math.sin(t * 1.6 + i * 0.9) * 6;
        const scale = 1 + 0.08 * Math.sin(t * 2.4 + i) + lift * 0.004;
        el.style.transform = `translateY(${y.toFixed(1)}px) rotate(${rot.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
        el.style.color = `hsl(${(46 + i * 14 + journey.hue.get()) % 360}, 100%, ${66 + lift * 0.2}%)`;
      });
      if (!reduce) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [word, journey]);

  function shuffle() {
    const next = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    setWord(next === word ? "VIAGEM" : next);
  }

  return (
    <section id="digita" aria-label="Digita e vira onda" className="relative z-10 px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl text-center">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-4 py-2 text-[11px] font-bold tracking-[0.28em] text-white/85 uppercase backdrop-blur">
          <Type className="size-3.5 text-sun" aria-hidden="true" />
          Digita e vira onda
        </p>
        <h2 className="font-display text-[clamp(2.6rem,8vw,5.5rem)] leading-[0.9] font-bold tracking-tight text-white">
          SUA PALAVRA <span className="text-gradient-sun">FLUTUA</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-white/75">
          Digite qualquer palavra. Passe o dedo por cima e role rápido — as letras surfam.
        </p>

        {/* living word */}
        <div
          ref={stageRef}
          aria-live="polite"
          className="mt-12 flex min-h-[22svh] flex-wrap items-center justify-center gap-[0.06em] overflow-hidden px-2"
        >
          {letters.map((ch, i) => (
            <span
              key={`${ch}-${i}`}
              ref={(el) => {
                charsRef.current[i] = el;
              }}
              aria-hidden={ch === " " ? true : undefined}
              className="inline-block font-display text-[clamp(3.2rem,13vw,9rem)] leading-none font-bold tracking-tight will-change-transform"
              style={{ color: "#ffc93c" }}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
          {letters.length === 0 && (
            <span className="font-display text-4xl font-bold text-white/40">digite aí embaixo…</span>
          )}
        </div>
        <p className="sr-only">Palavra atual: {word || "vazia"}</p>

        {/* input + presets */}
        <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-4">
          <div className="flex w-full gap-3">
            <label htmlFor="typewave-input" className="sr-only">
              Digite uma palavra para virar onda
            </label>
            <input
              id="typewave-input"
              type="text"
              value={word}
              maxLength={14}
              onChange={(e) => setWord(e.target.value.toUpperCase().replace(/[^A-ZÀ-Ú ]/g, ""))}
              placeholder="DIGITE UMA PALAVRA"
              className="min-w-0 flex-1 rounded-full border border-white/25 bg-black/40 px-6 py-4 text-center font-display text-lg font-bold tracking-[0.2em] text-white uppercase placeholder:text-white/40 focus:border-sun focus:outline-none"
            />
            <button
              type="button"
              onClick={shuffle}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-sun px-5 py-4 text-sm font-bold text-deep transition-transform hover:scale-105"
            >
              <Shuffle className="size-4" aria-hidden="true" />
              Sortear
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setWord(p)}
                aria-pressed={word === p}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  word === p ? "bg-sun text-deep" : "border border-white/25 bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
