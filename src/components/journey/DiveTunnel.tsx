"use client";

import { motion, useScroll, useTransform, useMotionTemplate } from "motion/react";
import { useRef } from "react";

/** MERGULHO — o túnel entre os labs do dia e a zona psicodélica da noite.
 *  Um trecho sticky: ao rolar, o texto escala, desfoca e você atravessa
 *  anéis concêntricos como se mergulhasse debaixo d'água. */
export function DiveTunnel() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.55, 1.4, 3.4]);
  const blurVal = useTransform(scrollYProgress, [0, 0.45, 1], [0, 1, 12]);
  const blur = useMotionTemplate`blur(${blurVal}px)`;
  const textOpacity = useTransform(scrollYProgress, [0, 0.35, 0.7], [0, 1, 0]);
  const ringScale = useTransform(scrollYProgress, [0, 1], [0.4, 2.6]);
  const ringOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 0.6, 0]);

  return (
    <section aria-label="Mergulho — túnel para a zona psicodélica" className="relative z-10">
      <div ref={wrapRef} className="relative h-[220svh]">
        <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden">
          {/* concentric rings you fall through */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              aria-hidden="true"
              style={{ scale: ringScale, opacity: ringOpacity }}
              className="absolute rounded-full border-2 border-sky/40"
              // stagger ring sizes via inline size
            >
              <div
                className="rounded-full border-2 border-sky/40"
                style={{ width: `${280 + i * 160}px`, height: `${280 + i * 160}px` }}
              />
            </motion.div>
          ))}
          <motion.div style={{ scale, filter: blur }} className="relative z-10 px-5 text-center will-change-transform">
            <motion.p
              style={{ opacity: textOpacity }}
              className="font-display text-[clamp(3.5rem,14vw,11rem)] leading-[0.85] font-bold tracking-[-0.03em] text-white"
            >
              MER<span className="text-gradient-sun">GULHE</span>
            </motion.p>
            <motion.p
              style={{ opacity: textOpacity }}
              className="mt-4 text-sm font-bold tracking-[0.3em] text-sun uppercase"
            >
              agora a viagem fica mais funda
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
