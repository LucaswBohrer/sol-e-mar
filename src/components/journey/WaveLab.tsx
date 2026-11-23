"use client";

import { useEffect, useRef, useState } from "react";
import { AudioWaveform, Sparkles, Wind } from "lucide-react";
import type { Journey } from "@/lib/journey";

/** ONDA — a wave synth you play with your finger. Draw on the water to add
 *  energy, wind and speed shape the field live, and the psychedelic toggle
 *  pushes the whole site (shader included) into hue-shift overdrive. */
export function WaveLab({ journey }: { journey: Journey }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [wind, setWind] = useState(0.5);
  const [speed, setSpeed] = useState(0.6);
  const [psyche, setPsyche] = useState(false);
  const paramsRef = useRef({ wind: 0.5, speed: 0.6, psyche: false });

  useEffect(() => {
    paramsRef.current = { wind, speed, psyche };
  }, [wind, speed, psyche]);

  useEffect(() => {
    journey.psyche.set(psyche ? 1 : 0);
  }, [psyche, journey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      w = wrap!.clientWidth;
      h = wrap!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // energy bumps: {x (0..1), strength} that decay over time
    const bumps: { x: number; s: number }[] = [];
    let down = false;

    function addBump(clientX: number, clientY: number, power: number) {
      const r = canvas!.getBoundingClientRect();
      const x = (clientX - r.left) / r.width;
      const y = (clientY - r.top) / r.height;
      // only the water half of the panel takes energy
      if (y < 0.15) return;
      bumps.push({ x, s: power });
      if (bumps.length > 40) bumps.shift();
    }
    function onMove(e: PointerEvent) {
      if (down) addBump(e.clientX, e.clientY, 26);
      else addBump(e.clientX, e.clientY, 4);
    }
    function onDown(e: PointerEvent) {
      down = true;
      addBump(e.clientX, e.clientY, 46);
    }
    function onUp() {
      down = false;
    }
    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });

    let raf = 0;
    const start = performance.now();

    function draw(now: number) {
      const t = (now - start) / 1000;
      const { wind: wd, speed: sp, psyche: ps } = paramsRef.current;
      ctx!.clearRect(0, 0, w, h);
      const layers = 5;
      for (let l = 0; l < layers; l++) {
        const depth = l / layers; // 0 = back, 1 = front
        const baseY = h * (0.34 + depth * 0.14);
        const amp = (6 + depth * 16) * (0.4 + wd);
        const freq = 1.6 + depth * 1.4;
        const hue = ps ? (t * 60 + l * 55) % 360 : 200 - depth * 25;
        const sat = ps ? 95 : 85;
        const light = 72 - depth * 30;
        ctx!.beginPath();
        for (let x = 0; x <= w; x += 6) {
          const nx = x / w;
          let y = baseY;
          y += Math.sin(nx * Math.PI * 2 * freq + t * (0.7 + sp * 1.8) + l * 1.3) * amp;
          y += Math.sin(nx * Math.PI * 2 * freq * 2.7 - t * (0.5 + sp) + l) * amp * 0.35;
          // wind lean
          y += Math.sin(nx * 4 + t * 0.9) * wd * 8 * depth;
          // pointer bumps
          for (const b of bumps) {
            const d = nx - b.x;
            y -= b.s * Math.exp(-(d * d) / 0.004) * Math.sin(t * 6 - d * 30);
          }
          if (x === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, ${0.35 + depth * 0.5})`;
        ctx!.lineWidth = 1.4 + depth * 2.4;
        ctx!.lineJoin = "round";
        ctx!.stroke();
        // fill under the front wave with a soft glow
        if (l === layers - 1) {
          ctx!.lineTo(w, h);
          ctx!.lineTo(0, h);
          ctx!.closePath();
          ctx!.fillStyle = ps
            ? `hsla(${(t * 60) % 360}, 90%, 55%, 0.16)`
            : "rgba(14, 90, 138, 0.28)";
          ctx!.fill();
        }
      }
      // decay bumps
      for (let i = bumps.length - 1; i >= 0; i--) {
        bumps[i].s *= 0.985;
        if (bumps[i].s < 0.4) bumps.splice(i, 1);
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <section id="onda" aria-label="Onda — desenhe ondas com o dedo" className="relative z-10 px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 px-1">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-4 py-2 text-[11px] font-bold tracking-[0.28em] text-white/85 uppercase backdrop-blur">
              <AudioWaveform className="size-3.5 text-sun" aria-hidden="true" />
              Lab 03 — Onda
            </p>
            <h2 className="font-display text-[clamp(2.6rem,8vw,5.5rem)] leading-[0.9] font-bold tracking-tight text-white">
              ONDA<span className="text-sun">.</span>
            </h2>
            <p className="mt-3 max-w-md text-base leading-relaxed text-white/75">
              Desenhe na água. O vento e a velocidade mudam o mar de verdade.
            </p>
          </div>
          <button
            type="button"
            aria-pressed={psyche}
            onClick={() => setPsyche((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all ${
              psyche
                ? "bg-sun text-deep shadow-[0_0_36px_rgba(255,201,60,0.6)]"
                : "border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20"
            }`}
          >
            <Sparkles className="size-4" aria-hidden="true" />
            {psyche ? "Modo psicodélico: ON" : "Modo psicodélico"}
          </button>
        </div>

        <div
          ref={wrapRef}
          className="relative h-[62svh] touch-none overflow-hidden rounded-[2rem] border border-white/20 bg-[#04101f]/55 shadow-[0_30px_80px_rgba(2,7,15,0.5)] backdrop-blur-md"
        >
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-crosshair" />
          <p className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/30 px-4 py-1.5 text-[11px] font-bold tracking-[0.25em] text-white/70 uppercase backdrop-blur">
            desenhe aqui
          </p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur">
            <label htmlFor="wind-range" className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
              <Wind className="size-4 text-sky-soft" aria-hidden="true" />
              Vento — {Math.round(wind * 100)}%
            </label>
            <input
              id="wind-range"
              type="range"
              min={0}
              max={100}
              value={Math.round(wind * 100)}
              onChange={(e) => setWind(Number(e.target.value) / 100)}
              className="range-sun w-full"
            />
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur">
            <label htmlFor="speed-range" className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
              <AudioWaveform className="size-4 text-sun" aria-hidden="true" />
              Velocidade — {Math.round(speed * 100)}%
            </label>
            <input
              id="speed-range"
              type="range"
              min={0}
              max={100}
              value={Math.round(speed * 100)}
              onChange={(e) => setSpeed(Number(e.target.value) / 100)}
              className="range-sun w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
