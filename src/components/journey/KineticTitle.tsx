"use client";

import { motion, useMotionValueEvent, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import type { Journey } from "@/lib/journey";
import { EASE } from "@/animations/motion";

const WORDS = ["SOL", "&", "MAR"] as const;

/** Giant display type that lives: chars spring in one by one, stretch with
 *  scroll velocity, and bend away from the pointer. The hot path mutates
 *  DOM styles directly — no React re-renders per pointer move. */
export function KineticTitle({ journey }: { journey: Journey }) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const pointerRef = useRef({ x: -9999, y: -9999 });
  const stretchRef = useRef(1);

  function apply() {
    const wrap = wrapRef.current;
    if (!wrap || reduce) return;
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const s = stretchRef.current;
    charsRef.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const ex = r.left + r.width / 2;
      const ey = r.top + r.height / 2;
      const dx = ex - pointerRef.current.x;
      const dy = ey - pointerRef.current.y;
      const d = Math.hypot(dx, dy) || 1;
      const force = Math.max(0, 1 - d / 260);
      const push = force * 26;
      const rot = (dx / d) * force * 10;
      // gentle wave: chars far from the centre drift with scroll stretch
      const wave = Math.sin(i * 0.9) * (s - 1) * 14;
      el.style.transform = `translate(${(dx / d) * push}px, ${(dy / d) * push + wave}px) rotate(${rot}deg) scaleY(${s})`;
      el.style.transformOrigin = "center";
      void cx;
      void cy;
    });
  }

  useMotionValueEvent(journey.velocity, "change", (v) => {
    if (reduce) return;
    const target = 1 + Math.min(Math.abs(v) / 2600, 0.45);
    stretchRef.current += (target - stretchRef.current) * 0.35;
    apply();
  });

  useEffect(() => {
    if (reduce) return;
    function onMove(e: PointerEvent) {
      pointerRef.current = { x: e.clientX, y: e.clientY };
      apply();
    }
    function onLeave() {
      pointerRef.current = { x: -9999, y: -9999 };
      apply();
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  let idx = 0;
  return (
    <div ref={wrapRef} className="select-none" aria-label="SOL & MAR">
      <h1 className="sr-only">SOL &amp; MAR — onde o sol encontra o mar</h1>
      <div aria-hidden="true" className="flex flex-wrap items-baseline justify-center gap-x-[0.12em] leading-[0.85]">
        {WORDS.map((word, wi) => (
          <span key={word} className="flex">
            {word.split("").map((ch) => {
              const i = idx++;
              return (
                <motion.span
                  key={`${word}-${i}`}
                  ref={(el) => {
                    charsRef.current[i] = el;
                  }}
                  initial={{ opacity: 0, y: 90, rotate: -8 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 14,
                    delay: 0.15 + i * 0.055,
                  }}
                  className={`kinetic-char inline-block font-display font-bold tracking-[-0.04em] ${
                    word === "&"
                      ? "font-editorial font-medium italic text-sun"
                      : "text-white"
                  } text-[clamp(4rem,17vw,13rem)] ${
                    wi === 2 ? "text-gradient-sun" : ""
                  }`}
                  style={{ textShadow: "0 10px 60px rgba(2, 16, 31, 0.55)" }}
                >
                  {ch}
                </motion.span>
              );
            })}
          </span>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
        className="mt-6 text-center font-editorial text-2xl text-white/85 italic sm:text-3xl"
      >
        uma viagem — não uma página.
      </motion.p>
    </div>
  );
}
