"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { EASE } from "@/animations/motion";

const LINES = [
  { text: "O SOL NASCE.", accent: false },
  { text: "O MAR RESPONDE.", accent: true },
  { text: "VOCÊ MERGULHA.", accent: false },
] as const;

const DRIFT = ["MERGULHE", "RESPIRE", "FLUTUE", "DERRETA", "RENASÇA"];

/** Kinetic manifesto — no editorial About anymore. Three huge lines that
 *  spring in as you scroll, then one horizontal drift stretch where the
 *  words slide sideways with the scroll. */
export function Manifesto() {
  const driftRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: driftRef,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["4%", "-52%"]);

  return (
    <section id="manifesto" aria-label="Manifesto" className="relative z-10 overflow-hidden py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {LINES.map((line, i) => (
          <div key={line.text} className="overflow-hidden">
            <motion.p
              initial={{ y: "110%" }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: EASE }}
              className={`font-display text-[clamp(2.8rem,10vw,8rem)] leading-[0.95] font-bold tracking-[-0.03em] ${
                line.accent ? "text-gradient-sun" : "text-white"
              }`}
            >
              {line.text}
            </motion.p>
          </div>
        ))}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="mt-10 max-w-xl font-editorial text-2xl text-white/75 italic sm:text-3xl"
        >
          Nada aqui é só para olhar. Tudo responde ao seu toque, ao seu
          scroll, ao seu tempo.
        </motion.p>
      </div>

      {/* horizontal drift stretch */}
      <div ref={driftRef} aria-hidden="true" className="mt-24 overflow-hidden border-y border-white/10 py-8">
        <motion.div style={{ x }} className="flex w-max items-center gap-10 will-change-transform">
          {[...DRIFT, ...DRIFT, ...DRIFT].map((w, i) => (
            <span key={`${w}-${i}`} className="flex items-center gap-10">
              <span
                className={`font-display text-6xl font-bold tracking-tight whitespace-nowrap sm:text-8xl ${
                  i % 2 === 0 ? "text-white/90" : "text-outline-light"
                }`}
              >
                {w}
              </span>
              <span className="inline-block size-4 rotate-45 bg-sun" />
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
