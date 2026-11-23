"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { MousePointerClick, MoveDown } from "lucide-react";
import { OceanShader } from "@/components/journey/OceanShader";
import { RippleLayer } from "@/components/journey/RippleLayer";
import { KineticTitle } from "@/components/journey/KineticTitle";
import { VelocityMarquee } from "@/components/journey/VelocityMarquee";
import { TideLab } from "@/components/journey/TideLab";
import { SunLab } from "@/components/journey/SunLab";
import { WaveLab } from "@/components/journey/WaveLab";
import { Manifesto } from "@/components/journey/Manifesto";
import { TopBar } from "@/components/journey/TopBar";
import { Footer } from "@/components/journey/Footer";
import { phaseFor, type Journey } from "@/lib/journey";

/** SOL & MAR v2 — "uma viagem, não uma página".
 *  One scroll journey: the shader ocean is the fixed world, the sun travels
 *  across the sky as you scroll (dawn → noon → golden hour → dusk → night),
 *  and three full-screen labs are instruments you play, not cards you read. */
export default function Home() {
  const mainRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: mainRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 55, damping: 20, mass: 0.5 });
  const velocity = useVelocity(smooth);

  // Day-cycle: sun arc + night fall, driven by the whole-page scroll.
  const sunX = useTransform(smooth, [0, 1], [0.14, 0.86]);
  const sunY = useTransform(smooth, [0, 0.25, 0.5, 0.75, 1], [0.58, 0.85, 0.62, 0.56, 0.72]);
  const night = useTransform(smooth, [0.72, 0.95], [0, 1]);
  const psyche = useMotionValue(0);

  const journey: Journey = { progress: smooth, velocity, sunX, sunY, night, psyche };

  const [phase, setPhase] = useState(phaseFor(0));
  const phaseRef = useRef(phase.label);
  useMotionValueEvent(smooth, "change", (v) => {
    const p = phaseFor(v);
    if (p.label !== phaseRef.current) {
      phaseRef.current = p.label;
      setPhase(p);
    }
  });

  // Hero title drifts up and fades as the journey begins.
  const heroY = useTransform(smooth, [0, 0.18], [0, -140]);
  const heroOpacity = useTransform(smooth, [0, 0.14], [1, 0]);

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[70] focus:rounded-full focus:bg-sun focus:px-5 focus:py-2.5 focus:font-bold focus:text-deep"
      >
        Pular para a viagem
      </a>
      <OceanShader journey={journey} />
      <RippleLayer />
      <TopBar phase={phase.label} time={phase.time} />
      <main ref={mainRef} className="relative z-10">
        {/* HERO — the shader is the world; the type is the only furniture */}
        <section
          id="top"
          aria-label="Introdução"
          className="relative flex min-h-svh flex-col items-center justify-center px-5 pt-24 pb-20"
        >
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="w-full">
            <KineticTitle journey={journey} />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mt-10 flex flex-col items-center gap-3"
            >
              <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-4 py-2 text-xs font-bold tracking-[0.2em] text-white/85 uppercase backdrop-blur">
                <MousePointerClick className="size-4 text-sun" aria-hidden="true" />
                Clique em qualquer lugar — a água responde
              </p>
              <p className="text-sm text-white/60">Role e o dia inteiro passa diante de você</p>
            </motion.div>
          </motion.div>
          <motion.a
            href="#mare"
            aria-label="Descer para o laboratório da maré"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2"
          >
            <span className="flex flex-col items-center gap-2 text-[11px] font-bold tracking-[0.3em] text-white/70 uppercase">
              Começar a viagem
              <MoveDown className="size-5 animate-bounce text-sun" aria-hidden="true" />
            </span>
          </motion.a>
        </section>

        <div id="conteudo">
          <VelocityMarquee journey={journey} />
        </div>

        <TideLab />
        <SunLab />
        <WaveLab journey={journey} />
        <Manifesto />
        <Footer />
      </main>
    </>
  );
}
