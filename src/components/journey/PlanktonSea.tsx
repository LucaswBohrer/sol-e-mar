"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkle, Sun } from "lucide-react";
import type { Journey } from "@/lib/journey";

type Particle = {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
  hue: number;
  flash: number;
};

/** PLÂNCTON VIVO — um mar de partículas brilhantes. Elas derivam, fogem do
 *  dedo, e acendem quando você toca. Densidade e brilho mudam o campo. */
export function PlanktonSea({ journey }: { journey: Journey }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: -999, y: -999, down: false });
  const [density, setDensity] = useState(1);
  const [glow, setGlow] = useState(1);
  const paramsRef = useRef({ density: 1, glow: 1 });

  useEffect(() => {
    paramsRef.current = { density, glow };
  }, [density, glow]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 640;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    let particles: Particle[] = [];

    function seed() {
      const max = isMobile ? 350 : 900;
      particles = Array.from({ length: max }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.8 + Math.random() * 2.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.7,
        hue: 165 + Math.random() * 45,
        flash: 0,
      }));
    }
    function resize() {
      w = wrap!.clientWidth;
      h = wrap!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    function onMove(e: PointerEvent) {
      const r = canvas!.getBoundingClientRect();
      pointerRef.current.x = e.clientX - r.left;
      pointerRef.current.y = e.clientY - r.top;
    }
    function onDown(e: PointerEvent) {
      onMove(e);
      pointerRef.current.down = true;
      // burst: everything near the touch lights up
      for (const p of particles) {
        const dx = p.x - pointerRef.current.x;
        const dy = p.y - pointerRef.current.y;
        if (dx * dx + dy * dy < 180 * 180) p.flash = 1;
      }
    }
    function onUp() {
      pointerRef.current.down = false;
    }
    function onLeave() {
      pointerRef.current.x = -999;
      pointerRef.current.y = -999;
    }
    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    canvas.addEventListener("pointerleave", onLeave, { passive: true });

    let raf = 0;
    const start = performance.now();

    function draw(now: number) {
      const t = (now - start) / 1000;
      const hueShift = journey.hue.get();
      const { density: den, glow: gl } = paramsRef.current;
      ctx!.clearRect(0, 0, w, h);
      const bg = ctx!.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
      bg.addColorStop(0, "#062a44");
      bg.addColorStop(1, "#02070f");
      ctx!.fillStyle = bg;
      ctx!.fillRect(0, 0, w, h);

      const active = Math.floor(particles.length * den);
      const px = pointerRef.current.x;
      const py = pointerRef.current.y;
      ctx!.globalCompositeOperation = "lighter";
      for (let i = 0; i < active; i++) {
        const p = particles[i];
        // drift: slow sine swim + gentle current
        p.x += Math.sin(t * p.speed + p.phase) * 0.35 + 0.12;
        p.y += Math.cos(t * p.speed * 0.8 + p.phase * 1.3) * 0.28 - 0.06;
        if (p.x > w + 10) p.x = -10;
        if (p.x < -10) p.x = w + 10;
        if (p.y > h + 10) p.y = -10;
        if (p.y < -10) p.y = h + 10;
        // flee the pointer
        const dx = p.x - px;
        const dy = p.y - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < 120 * 120 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const push = ((120 - d) / 120) * 2.4;
          p.x += (dx / d) * push;
          p.y += (dy / d) * push;
        }
        p.flash *= 0.985;
        const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 2 + p.phase * 3));
        const alpha = Math.min(1, (0.25 + tw * 0.6 + p.flash * 0.9) * gl);
        const hue = (p.hue + hueShift) % 360;
        ctx!.fillStyle = `hsla(${hue}, 95%, ${62 + p.flash * 25}%, ${alpha})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * (1 + p.flash * 1.6) * (0.8 + gl * 0.3), 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalCompositeOperation = "source-over";
      if (!reduce) raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [journey]);

  return (
    <section id="plancton" aria-label="Plâncton vivo" className="relative z-10 px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 px-1">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-4 py-2 text-[11px] font-bold tracking-[0.28em] text-white/85 uppercase backdrop-blur">
              <Sparkle className="size-3.5 text-sun" aria-hidden="true" />
              Mar vivo — Plâncton
            </p>
            <h2 className="font-display text-[clamp(2.6rem,8vw,5.5rem)] leading-[0.9] font-bold tracking-tight text-white">
              PLÂNCTON <span className="text-gradient-sun">VIVO</span>
            </h2>
            <p className="mt-3 max-w-md text-base leading-relaxed text-white/75">
              Milhares de luzinhas vivas. Passe o dedo e elas fogem — toque e elas acendem.
            </p>
          </div>
        </div>
        <div
          ref={wrapRef}
          className="relative h-[68svh] touch-none overflow-hidden rounded-[2rem] border border-white/20 bg-[#02070f]/70 shadow-[0_30px_80px_rgba(2,7,15,0.5)]"
        >
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-crosshair" />
          <p className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/30 px-4 py-1.5 text-[11px] font-bold tracking-[0.25em] text-white/70 uppercase backdrop-blur">
            toque para acender · passe o dedo para espantar
          </p>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur">
            <label htmlFor="density-range" className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
              <Sparkle className="size-4 text-sky-soft" aria-hidden="true" />
              Densidade — {Math.round(density * 100)}%
            </label>
            <input
              id="density-range"
              type="range"
              min={20}
              max={100}
              value={Math.round(density * 100)}
              onChange={(e) => setDensity(Number(e.target.value) / 100)}
              className="range-sun w-full"
            />
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur">
            <label htmlFor="glow-range" className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
              <Sun className="size-4 text-sun" aria-hidden="true" />
              Brilho — {Math.round(glow * 100)}%
            </label>
            <input
              id="glow-range"
              type="range"
              min={30}
              max={180}
              value={Math.round(glow * 100)}
              onChange={(e) => setGlow(Number(e.target.value) / 100)}
              className="range-sun w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
