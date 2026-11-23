"use client";

import { motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Sun } from "lucide-react";

/** SOL — full-screen sticky lab. Drag the sun across the sky (or scrub the
 *  slider): light, colour and the hour follow. 06:00 → 21:00 in one gesture. */
export function SunLab() {
  const areaRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const dragging = useRef(false);

  const time = useMotionValue(0.55); // 0 = 06:00, 1 = 21:00
  const smooth = useSpring(time, { stiffness: 80, damping: 18, mass: 0.6 });
  const [timeState, setTimeState] = useState(55);

  const sunX = useTransform(smooth, [0, 1], ["4%", "86%"]);
  const sunY = useTransform(smooth, [0, 0.5, 1], ["74%", "10%", "70%"]);
  const sunScale = useTransform(smooth, [0, 0.5, 1], [1.25, 0.9, 1.35]);
  const tint = useTransform(
    smooth,
    [0, 0.35, 0.55, 0.8, 1],
    [
      "rgba(255, 159, 28, 0.28)",
      "rgba(77, 178, 232, 0.08)",
      "rgba(255, 201, 60, 0.14)",
      "rgba(255, 110, 40, 0.30)",
      "rgba(6, 20, 44, 0.55)",
    ],
  );
  const label = useTransform(smooth, [0, 0.5, 1], ["nascer do sol", "meio-dia", "pôr do sol"]);

  useMotionValueEvent(smooth, "change", (v) => {
    const minutes = 6 * 60 + v * 15 * 60;
    const hh = Math.floor(minutes / 60);
    const mm = Math.round(minutes % 60);
    if (timeRef.current) {
      timeRef.current.textContent = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    }
    if (rangeRef.current) rangeRef.current.value = String(Math.round(v * 100));
  });

  function setFromClientX(clientX: number) {
    const el = areaRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    time.set(Math.min(1, Math.max(0, (clientX - r.left) / r.width)));
  }

  return (
    <section id="sol" aria-label="Sol — arraste o sol pelo céu" className="relative z-10">
      <div
        ref={areaRef}
        className="sticky top-0 flex h-svh touch-none flex-col items-center justify-center overflow-hidden"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging.current) setFromClientX(e.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
          setTimeState(Math.round(smooth.get() * 100));
        }}
        onPointerCancel={() => {
          dragging.current = false;
          setTimeState(Math.round(smooth.get() * 100));
        }}
      >
        {/* light tint follows the hour */}
        <motion.div aria-hidden="true" style={{ backgroundColor: tint }} className="absolute inset-0" />

        {/* the draggable sun */}
        <motion.div
          aria-hidden="true"
          style={{ left: sunX, top: sunY, scale: sunScale }}
          className="absolute size-28 rounded-full bg-[radial-gradient(circle_at_35%_35%,#ffe98a,#ffc93c_45%,#ff9f1c_75%,#ff6e28)] shadow-[0_0_90px_30px_rgba(255,159,28,0.45)] sm:size-36"
        >
          <span className="absolute inset-[-28%] rounded-full border border-sun/30" />
          <span className="absolute inset-[-60%] rounded-full border border-sun/15" />
        </motion.div>

        <div className="relative z-10 flex flex-col items-center px-5 text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-4 py-2 text-[11px] font-bold tracking-[0.28em] text-white/85 uppercase backdrop-blur">
            <Sun className="size-3.5 text-sun" aria-hidden="true" />
            Lab 02 — Sol
          </p>
          <span aria-hidden="true" className="block font-display text-[clamp(4.5rem,20vw,15rem)] leading-[0.85] font-bold tracking-[-0.04em] text-white drop-shadow-[0_12px_50px_rgba(2,16,31,0.6)]">
            SOL
          </span>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-white/80 sm:text-lg">
            Arraste o sol pelo céu. A luz muda — e o dia inteiro passa.
          </p>
          <p className="mt-4 font-display text-6xl font-bold text-sun tabular-nums drop-shadow-[0_4px_24px_rgba(255,159,28,0.45)]">
            <span ref={timeRef}>14:15</span>
          </p>
          <motion.p className="mt-2 text-sm font-semibold tracking-[0.25em] text-white/70 uppercase">
            {label}
          </motion.p>
        </div>

        <div className="absolute bottom-6 left-1/2 z-20 w-[min(420px,86vw)] -translate-x-1/2">
          <label htmlFor="sun-range" className="sr-only">
            Hora do dia — {timeState}%
          </label>
          <input
            id="sun-range"
            ref={rangeRef}
            type="range"
            min={0}
            max={100}
            defaultValue={55}
            onChange={(e) => {
              time.set(Number(e.target.value) / 100);
              setTimeState(Number(e.target.value));
            }}
            className="range-sun w-full"
          />
          <div className="mt-2 flex justify-between text-[11px] font-bold tracking-[0.2em] text-white/60 uppercase">
            <span>06:00</span>
            <span>21:00</span>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="h-[80svh]" />
    </section>
  );
}
