"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { Aperture, RotateCw } from "lucide-react";
import type { Journey } from "@/lib/journey";

/** CALEIDOSCÓPIO — o oceano virado mandala. O padrão é desenhado ao vivo
 *  num canvas offscreen e espelhado em segmentos que se multiplicam com o
 *  scroll; arrastar gira a mandala, o ponteiro deforma o padrão. */
export function Kaleidoscope({ journey }: { journey: Journey }) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const segRef = useRef<HTMLSpanElement>(null);
  const rotRef = useRef(0);
  const dragRef = useRef<{ down: boolean; lastX: number }>({ down: false, lastX: 0 });
  const segmentsRef = useRef(8);
  const [segments, setSegments] = useState(8);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const segValue = useTransform(scrollYProgress, [0, 1], [6, 16]);
  useMotionValueEvent(segValue, "change", (v) => {
    const s = Math.round(v);
    if (s !== segmentsRef.current) {
      segmentsRef.current = s;
      setSegments(s);
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 640;

    const off = document.createElement("canvas");
    off.width = 480;
    off.height = 480;
    const octx = off.getContext("2d");
    if (!octx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    function resize() {
      w = section!.clientWidth;
      h = section!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(section);

    let raf = 0;
    const start = performance.now();

    function drawPattern(t: number, hue: number) {
      octx!.clearRect(0, 0, 480, 480);
      octx!.save();
      octx!.translate(240, 240);
      // rotating wave arcs
      for (let i = 0; i < 5; i++) {
        const r = 60 + i * 42;
        const a0 = t * (0.2 + i * 0.07) + i * 1.1;
        octx!.beginPath();
        octx!.arc(0, 0, r, a0, a0 + Math.PI * (0.7 + 0.3 * Math.sin(t * 0.8 + i)));
        octx!.strokeStyle = `hsla(${(hue + i * 38) % 360}, 95%, ${62 - i * 6}%, 0.9)`;
        octx!.lineWidth = 10 - i;
        octx!.stroke();
      }
      // glowing blobs orbiting the centre
      for (let i = 0; i < 6; i++) {
        const a = t * 0.5 + (i * Math.PI * 2) / 6;
        const r = 130 + 40 * Math.sin(t * 0.9 + i * 2);
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        const g = octx!.createRadialGradient(x, y, 0, x, y, 42);
        g.addColorStop(0, `hsla(${(hue + i * 55) % 360}, 100%, 65%, 0.9)`);
        g.addColorStop(1, "hsla(210, 100%, 50%, 0)");
        octx!.fillStyle = g;
        octx!.beginPath();
        octx!.arc(x, y, 42, 0, Math.PI * 2);
        octx!.fill();
      }
      // sun core
      const g = octx!.createRadialGradient(0, 0, 0, 0, 0, 58);
      g.addColorStop(0, "#ffe98a");
      g.addColorStop(0.5, "#ffc93c");
      g.addColorStop(1, "rgba(255,159,28,0)");
      octx!.fillStyle = g;
      octx!.beginPath();
      octx!.arc(0, 0, 58, 0, Math.PI * 2);
      octx!.fill();
      octx!.restore();
    }

    function draw(now: number) {
      const t = (now - start) / 1000;
      const hue = journey.hue.get();
      if (!reduce) rotRef.current += 0.0016;
      drawPattern(t, hue);
      ctx!.clearRect(0, 0, w, h);
      ctx!.fillStyle = "#02070f";
      ctx!.fillRect(0, 0, w, h);
      const size = Math.min(w, h) * 0.92;
      const segs = segmentsRef.current;
      for (let i = 0; i < segs; i++) {
        ctx!.save();
        ctx!.translate(w / 2, h / 2);
        ctx!.rotate((i * Math.PI * 2) / segs + rotRef.current);
        if (i % 2 === 1) ctx!.scale(1, -1);
        ctx!.drawImage(off, -size / 2, -size / 2, size, size);
        ctx!.restore();
      }
      // centre sun
      ctx!.beginPath();
      ctx!.arc(w / 2, h / 2, 26, 0, Math.PI * 2);
      ctx!.fillStyle = "#ffc93c";
      ctx!.shadowColor = "rgba(255,201,60,0.9)";
      ctx!.shadowBlur = 40;
      ctx!.fill();
      ctx!.shadowBlur = 0;
      if (!reduce) raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [journey]);

  return (
    <section
      id="caleidoscopio"
      ref={sectionRef}
      aria-label="Caleidoscópio — espelho d'água"
      className="relative z-10"
    >
      <div
        className="relative h-svh touch-none overflow-hidden"
        onPointerDown={(e) => {
          dragRef.current = { down: true, lastX: e.clientX };
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (dragRef.current.down) {
            rotRef.current += (e.clientX - dragRef.current.lastX) * 0.004;
            dragRef.current.lastX = e.clientX;
          }
        }}
        onPointerUp={() => (dragRef.current.down = false)}
        onPointerCancel={() => (dragRef.current.down = false)}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing" />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center px-5 pt-24 text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-4 py-2 text-[11px] font-bold tracking-[0.28em] text-white/85 uppercase backdrop-blur">
            <Aperture className="size-3.5 text-sun" aria-hidden="true" />
            Espelho d&apos;água — Caleidoscópio
          </p>
          <h2 className="font-display text-[clamp(2.6rem,8vw,5.5rem)] leading-[0.9] font-bold tracking-tight text-white drop-shadow-[0_8px_40px_rgba(2,7,15,0.8)]">
            CALEIDO<span className="text-gradient-sun">SCÓPIO</span>
          </h2>
          <p className="mt-3 max-w-md text-base leading-relaxed text-white/80">
            Arraste para girar a mandala. Role e ela se multiplica.
          </p>
        </div>
        <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/25 bg-black/40 px-5 py-2.5 text-sm font-bold text-white backdrop-blur">
          <RotateCw className="size-4 text-sun" aria-hidden="true" />
          <span>
            <span ref={segRef}>{segments}</span> espelhos girando
          </span>
        </div>
      </div>
    </section>
  );
}
