"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  hue: number;
};

type Ring = { x: number; y: number; r: number; max: number; alpha: number };

/** Global splash layer: a fixed 2D canvas above the content (pointer-events
 *  none, never blocks a tap). Moving the pointer leaves a glowing trail,
 *  clicking bursts into droplets + an expanding ring, dragging draws water.
 *  Listens on window so it works over every lab, not just the hero. */
export function RippleLayer() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    const rings: Ring[] = [];
    let last = { x: -1, y: -1 };
    let down = false;

    function burst(x: number, y: number, n: number, power: number) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = (0.4 + Math.random() * 1.6) * power;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 0.6,
          life: 0,
          max: 40 + Math.random() * 40,
          size: 1 + Math.random() * 3.2,
          hue: Math.random() < 0.75 ? 45 : 195,
        });
      }
      rings.push({ x, y, r: 4, max: 90 + power * 40, alpha: 0.7 });
    }

    function onMove(e: PointerEvent) {
      const { clientX: x, clientY: y } = e;
      if (down && last.x >= 0) {
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 14) {
          particles.push({
            x,
            y,
            vx: dx * 0.02,
            vy: dy * 0.02,
            life: 0,
            max: 34,
            size: 2 + Math.random() * 2.5,
            hue: Math.random() < 0.5 ? 45 : 200,
          });
          last = { x, y };
        }
      } else {
        last = { x, y };
      }
    }
    function onDown(e: PointerEvent) {
      down = true;
      last = { x: e.clientX, y: e.clientY };
      burst(e.clientX, e.clientY, 16, 1.4);
    }
    function onUp() {
      down = false;
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });

    let raf = 0;
    function frame() {
      ctx!.clearRect(0, 0, w, h);
      // rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.r += 2.6;
        r.alpha *= 0.965;
        if (r.r > r.max || r.alpha < 0.02) {
          rings.splice(i, 1);
          continue;
        }
        ctx!.beginPath();
        ctx!.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(255, 201, 60, ${r.alpha})`;
        ctx!.lineWidth = 2;
        ctx!.stroke();
        ctx!.beginPath();
        ctx!.arc(r.x, r.y, r.r * 0.7, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(125, 200, 240, ${r.alpha * 0.7})`;
        ctx!.lineWidth = 1.2;
        ctx!.stroke();
      }
      // droplets
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.vy += 0.045;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        const a = Math.max(0, 1 - p.life / p.max);
        if (a <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * a + 0.4, 0, Math.PI * 2);
        ctx!.fillStyle =
          p.hue > 100
            ? `rgba(125, 200, 240, ${a * 0.9})`
            : `rgba(255, 201, 60, ${a * 0.95})`;
        ctx!.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40"
    />
  );
}
