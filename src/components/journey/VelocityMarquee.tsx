"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useRef } from "react";
import type { Journey } from "@/lib/journey";

const WORDS = [
  "SOL",
  "MAR",
  "MARÉ",
  "ONDA",
  "PÔR DO SOL",
  "BRISA",
  "HORIZONTE",
  "MERGULHO",
];

/** A marquee whose speed and direction follow scroll velocity: scroll fast
 *  and it races, scroll up and it runs backwards. Driven in rAF with a
 *  MotionValue — zero React re-renders. */
export function VelocityMarquee({ journey }: { journey: Journey }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const last = useRef(0);

  useAnimationFrame((t, delta) => {
    if (reduce) return;
    const track = trackRef.current;
    if (!track) return;
    const half = track.scrollWidth / 2;
    if (half === 0) return;
    const v = journey.velocity.get();
    const dt = Math.min(delta, 50) / 1000;
    // base drift + velocity boost (sign flips with scroll direction)
    const speed = 42 + v * 0.22;
    let next = x.get() - speed * dt;
    if (next <= -half) next += half;
    if (next > 0) next -= half;
    x.set(next);
    last.current = t;
  });

  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={key === "b"}>
      {WORDS.map((w) => (
        <span key={`${key}-${w}`} className="flex items-center">
          <span className="font-display text-5xl font-bold tracking-tight text-white/90 sm:text-7xl">
            {w}
          </span>
          <span aria-hidden="true" className="mx-6 inline-block size-3 rotate-45 bg-sun sm:mx-10" />
        </span>
      ))}
    </div>
  );

  return (
    <div
      aria-label="Sol, mar, maré, onda, pôr do sol, brisa, horizonte, mergulho"
      className="relative z-10 overflow-hidden border-y border-white/15 bg-deep/40 py-5 backdrop-blur-sm sm:py-7"
    >
      <motion.div ref={trackRef} style={{ x }} className="flex w-max will-change-transform">
        {row("a")}
        {row("b")}
      </motion.div>
    </div>
  );
}
