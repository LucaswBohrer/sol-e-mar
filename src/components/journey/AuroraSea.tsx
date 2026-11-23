"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import type { Journey } from "@/lib/journey";

type Star = { x: number; y: number; r: number; tw: number };
type Meteor = { x: number; y: number; vx: number; vy: number; life: number };

/** AURORA DO MAR — fitas de aurora fluindo sobre o céu noturno. O ponteiro
 *  mexe nas fitas, o clique lança uma estrela cadente. */
export function AuroraSea({ journey }: { journey: Journey }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.3, active: false });
  const [intensity, setIntensity] = useState(1);
  const paramsRef = useRef({ intensity: 1 });
  const meteorsRef = useRef<Meteor[]>([]);

  useEffect(() => {
    paramsRef.current.intensity = intensity;
  }, [intensity]);

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

    const stars: Star[] = Array.from({ length: isMobile ? 90 : 180 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.7,
      r: 0.4 + Math.random() * 1.4,
      tw: Math.random() * Math.PI * 2,
    }));

    function onMove(e: PointerEvent) {
      const r = canvas!.getBoundingClientRect();
      pointerRef.current = {
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top) / r.height,
        active: true,
      };
    }
    function onDown(e: PointerEvent) {
      onMove(e);
      const r = canvas!.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      meteorsRef.current.push({
        x: x * w,
        y: y * h,
        vx: 7 + Math.random() * 4,
        vy: 3 + Math.random() * 2,
        life: 1,
      });
      if (meteorsRef.current.length > 6) meteorsRef.current.shift();
    }
    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerdown", onDown, { passive: true });

    let raf = 0;
    const start = performance.now();

    function ribbonY(base: number, x: number, t: number, phase: number, amp: number) {
      const px = pointerRef.current.x * w;
      const py = pointerRef.current.y * h;
      let y = base + Math.sin(x * 0.004 + t * 0.45 + phase) * amp + Math.sin(x * 0.0012 - t * 0.22 + phase * 2) * amp * 1.6;
      if (pointerRef.current.active) {
        const d = (x - px) / 160;
        y -= 90 * Math.exp(-d * d) * Math.sin(py * 0.02 + t);
      }
      return y;
    }

    function draw(now: number) {
      const t = (now - start) / 1000;
      const hue = journey.hue.get();
      const inten = paramsRef.current.intensity;
      ctx!.clearRect(0, 0, w, h);
      const bg = ctx!.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#02070f");
      bg.addColorStop(0.6, "#04101f");
      bg.addColorStop(1, "#062a44");
      ctx!.fillStyle = bg;
      ctx!.fillRect(0, 0, w, h);

      // stars
      for (const s of stars) {
        const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.4 + s.tw));
        ctx!.fillStyle = `rgba(232,244,252,${a})`;
        ctx!.beginPath();
        ctx!.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      // aurora ribbons — additive, flowing
      ctx!.globalCompositeOperation = "lighter";
      const ribbons = [
        { base: h * 0.22, amp: 46, width: 90, hues: [190, 150, 48] },
        { base: h * 0.38, amp: 62, width: 120, hues: [160, 210, 55] },
        { base: h * 0.55, amp: 40, width: 70, hues: [210, 175, 45] },
      ];
      for (const rb of ribbons) {
        const grad = ctx!.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, `hsla(${(rb.hues[0] + hue) % 360}, 95%, 60%, ${0.0})`);
        grad.addColorStop(0.3, `hsla(${(rb.hues[0] + hue) % 360}, 95%, 62%, ${0.5 * inten})`);
        grad.addColorStop(0.6, `hsla(${(rb.hues[1] + hue) % 360}, 90%, 68%, ${0.55 * inten})`);
        grad.addColorStop(1, `hsla(${(rb.hues[2] + hue) % 360}, 100%, 60%, ${0.1 * inten})`);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = rb.width * inten;
        ctx!.lineCap = "round";
        ctx!.beginPath();
        for (let x = 0; x <= w; x += 14) {
          const y = ribbonY(rb.base, x, t, rb.base * 0.01, rb.amp);
          if (x === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.stroke();
      }
      ctx!.globalCompositeOperation = "source-over";

      // shooting stars
      for (let i = meteorsRef.current.length - 1; i >= 0; i--) {
        const m = meteorsRef.current[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.02;
        if (m.life <= 0 || m.x > w + 80) {
          meteorsRef.current.splice(i, 1);
          continue;
        }
        const grad = ctx!.createLinearGradient(m.x, m.y, m.x - m.vx * 12, m.y - m.vy * 12);
        grad.addColorStop(0, `rgba(255,233,138,${m.life})`);
        grad.addColorStop(1, "rgba(255,233,138,0)");
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 3;
        ctx!.beginPath();
        ctx!.moveTo(m.x, m.y);
        ctx!.lineTo(m.x - m.vx * 12, m.y - m.vy * 12);
        ctx!.stroke();
      }

      if (!reduce) raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
    };
  }, [journey]);

  return (
    <section id="aurora" aria-label="Aurora do mar" className="relative z-10 px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 px-1">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-4 py-2 text-[11px] font-bold tracking-[0.28em] text-white/85 uppercase backdrop-blur">
              <Sparkles className="size-3.5 text-sun" aria-hidden="true" />
              Céu noturno — Aurora
            </p>
            <h2 className="font-display text-[clamp(2.6rem,8vw,5.5rem)] leading-[0.9] font-bold tracking-tight text-white">
              AURORA <span className="text-gradient-sun">DO MAR</span>
            </h2>
            <p className="mt-3 max-w-md text-base leading-relaxed text-white/75">
              Mexa o dedo e as fitas do céu se mexem junto. Clique e uma estrela cadente cruza.
            </p>
          </div>
          <div className="w-full max-w-xs rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur">
            <label htmlFor="aurora-range" className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
              <Wand2 className="size-4 text-sun" aria-hidden="true" />
              Intensidade — {Math.round(intensity * 100)}%
            </label>
            <input
              id="aurora-range"
              type="range"
              min={30}
              max={160}
              value={Math.round(intensity * 100)}
              onChange={(e) => setIntensity(Number(e.target.value) / 100)}
              className="range-sun w-full"
            />
          </div>
        </div>
        <div
          ref={wrapRef}
          className="relative h-[68svh] touch-none overflow-hidden rounded-[2rem] border border-white/20 bg-[#02070f]/70 shadow-[0_30px_80px_rgba(2,7,15,0.5)]"
        >
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-crosshair" />
          <p className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/30 px-4 py-1.5 text-[11px] font-bold tracking-[0.25em] text-white/70 uppercase backdrop-blur">
            mexa o dedo · clique p/ estrela cadente
          </p>
        </div>
      </div>
    </section>
  );
}
