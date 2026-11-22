"use client";

import { useEffect, useRef, useState } from "react";
import { Wind, Waves } from "lucide-react";

type Layer = { base: number; amp: number; len: number; speed: number; color: string };

const LAYERS: Layer[] = [
  { base: 0.52, amp: 14, len: 0.012, speed: 0.9, color: "rgba(77, 178, 232, 0.55)" },
  { base: 0.64, amp: 18, len: 0.009, speed: 0.65, color: "rgba(14, 90, 138, 0.75)" },
  { base: 0.76, amp: 12, len: 0.016, speed: 1.15, color: "rgba(6, 42, 68, 0.9)" },
];

/** Three layers of waves roll under the wind; the pointer raises a swell
 *  where it passes. With `controls`, the visitor sets the wind and can
 *  send a travelling wave across the whole sea. */
export function WaveCanvas({ height = 260, controls = false }: { height?: number; controls?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const windRef = useRef(0.4);
  const pulseRef = useRef(0);
  const [wind, setWind] = useState(0.4);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const el: HTMLCanvasElement = canvas;
    const context: CanvasRenderingContext2D = ctx;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let w = (el.width = el.clientWidth * devicePixelRatio);
    let h = (el.height = height * devicePixelRatio);
    const mouse = { x: -9999, y: -9999 };
    let t = 0;

    function onMove(e: PointerEvent) {
      const r = el.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) * devicePixelRatio;
      mouse.y = (e.clientY - r.top) * devicePixelRatio;
    }
    function onLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }
    function onResize() {
      w = el.width = el.clientWidth * devicePixelRatio;
      h = el.height = height * devicePixelRatio;
    }

    function waveY(x: number, layer: Layer, phase: number, pulseX: number, pulseAmp: number) {
      let y = h * layer.base + Math.sin(x * layer.len + phase) * layer.amp * devicePixelRatio;
      // pointer swell: a soft gaussian bump around the pointer
      if (mouse.x > -100) {
        const d = (x - mouse.x) / (110 * devicePixelRatio);
        y -= Math.exp(-d * d) * 26 * devicePixelRatio;
      }
      // travelling pulse from "Enviar uma onda"
      if (pulseAmp > 0.5) {
        const d = (x - pulseX) / (140 * devicePixelRatio);
        y -= Math.exp(-d * d) * pulseAmp * devicePixelRatio;
      }
      return y;
    }

    function tick() {
      context.clearRect(0, 0, w, h);
      // sky
      const sky = context.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#E8F4FC");
      sky.addColorStop(0.55, "#F8FCFF");
      sky.addColorStop(0.55, "#F6E7C1");
      sky.addColorStop(1, "#F6E7C1");
      context.fillStyle = sky;
      context.fillRect(0, 0, w, h);
      // sun reflection on the horizon
      context.fillStyle = "rgba(255, 201, 60, 0.5)";
      context.beginPath();
      context.ellipse(w * 0.72, h * 0.52, 34 * devicePixelRatio, 10 * devicePixelRatio, 0, 0, Math.PI * 2);
      context.fill();

      t += 0.016 * (0.4 + windRef.current * 1.6);
      pulseRef.current *= 0.985;
      const pulseAmp = pulseRef.current;
      const pulseX = ((t * 260 * devicePixelRatio) % (w + 400)) - 200;

      for (const layer of LAYERS) {
        const phase = t * layer.speed * (0.5 + windRef.current);
        context.beginPath();
        context.moveTo(0, h);
        for (let x = 0; x <= w; x += 6 * devicePixelRatio) {
          context.lineTo(x, waveY(x, layer, phase, pulseX, pulseAmp));
        }
        context.lineTo(w, h);
        context.closePath();
        context.fillStyle = layer.color;
        context.fill();
      }
      // foam line on the front wave
      context.strokeStyle = "rgba(255,255,255,0.85)";
      context.lineWidth = 2 * devicePixelRatio;
      context.beginPath();
      const front = LAYERS[2];
      for (let x = 0; x <= w; x += 6 * devicePixelRatio) {
        const y = waveY(x, front, t * front.speed * (0.5 + windRef.current), pulseX, pulseAmp);
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();

      if (!reduced) raf = requestAnimationFrame(tick);
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [height]);

  function sendWave() {
    pulseRef.current = 34;
  }

  return (
    <div>
      <canvas
        ref={ref}
        style={{ height }}
        className="w-full touch-none rounded-2xl"
        role="img"
        aria-label="Interactive canvas: waves rolling, move your pointer to raise a swell"
      />
      {controls && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex min-w-44 flex-1 items-center gap-3 text-sm font-medium text-deep">
            <Wind className="size-4 shrink-0 text-sky" aria-hidden="true" />
            <span className="shrink-0">Wind</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(wind * 100)}
              onChange={(e) => {
                const v = Number(e.target.value) / 100;
                setWind(v);
                windRef.current = v;
              }}
              className="w-full accent-[#4DB2E8]"
              aria-label="Wind strength"
            />
            <span className="w-9 shrink-0 text-right text-ink/60">{Math.round(wind * 100)}%</span>
          </label>
          <button
            type="button"
            onClick={sendWave}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-sea px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sea/30 transition-transform hover:scale-[1.04]"
          >
            <Waves className="size-4" aria-hidden="true" />
            Enviar uma onda
          </button>
        </div>
      )}
    </div>
  );
}
