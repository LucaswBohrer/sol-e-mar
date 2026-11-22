"use client";

import { useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { Sun } from "@/components/effects/Sun";
import { PALETTE } from "@/lib/site";
import { Palette, MousePointerClick, Sparkles } from "lucide-react";

const PILLARS = [
  {
    icon: Palette,
    title: "Light as language",
    text: "Deep blue for depth and calm, golden yellow for warmth and arrival. Every shade in the palette earns its place — nothing is decoration for its own sake.",
  },
  {
    icon: MousePointerClick,
    title: "Interaction as meaning",
    text: "A page that ignores you is a poster. SOL & MAR only feels alive when you touch it — every experiment answers back, in real time, like a tide answering the moon.",
  },
  {
    icon: Sparkles,
    title: "Motion with manners",
    text: "Movement guides the eye, never shouts at it. Effects have hierarchy: a few expressive moments, the rest quiet and deliberate — and everything rests when you ask it to.",
  },
];

export function About() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const [sunHeight, setSunHeight] = useState(0.08);
  const sunScale = useTransform(scrollYProgress, [0.1, 0.7], [0.9, 1]);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const t = Math.min(1, Math.max(0, (v - 0.15) / 0.6));
    setSunHeight(0.08 + t * 0.92);
  });

  return (
    <section id="about" ref={ref} aria-label="About SOL and MAR" className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal className="relative order-2 lg:order-1">
            <div className="blob mx-auto flex max-w-md flex-col items-center bg-ice px-8 py-8 text-center">
              <motion.div style={{ scale: sunScale }}>
                <Sun size={300} height={sunHeight} label="Sun rising as you scroll" />
              </motion.div>
              <p className="mt-1 font-editorial text-2xl text-deep italic">
                It rises as you scroll.
              </p>
              <p className="mt-1 text-sm text-ink/60">
                This sun is tied to your scroll position — the page itself is the horizon.
              </p>
            </div>
          </Reveal>

          <div className="order-1 lg:order-2">
            <Reveal>
              <p className="text-xs font-bold tracking-[0.3em] text-amber uppercase">04 · Behind the sun</p>
              <h2 className="mt-4 font-display text-4xl leading-[1.05] font-bold text-deep sm:text-5xl">
                A lab where technology learns to be <span className="font-editorial font-medium text-amber italic">warm.</span>
              </h2>
              <p className="mt-6 max-w-xl leading-relaxed text-ink/70">
                SOL &amp; MAR began with a simple question: what if a website felt
                less like a document and more like a shoreline? A place with salt in
                the air, with golden light, with waves that answer when you arrive.
              </p>
              <p className="mt-4 max-w-xl leading-relaxed text-ink/70">
                It is an experimental laboratory of digital creativity — no clients, no
                briefs, no invented case studies. Just motion, color, typography and
                code, explored in public, one experiment at a time.
              </p>
            </Reveal>

            <div className="mt-10 space-y-6">
              {PILLARS.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.08}>
                  <div className="flex gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ice text-deep">
                      <p.icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-deep">{p.title}</h3>
                      <p className="mt-1 max-w-lg leading-relaxed text-ink/65">{p.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.1}>
              <div className="mt-10">
                <p className="text-xs font-bold tracking-[0.25em] text-deep/50 uppercase">
                  The palette — nothing else enters the shoreline
                </p>
                <div className="mt-3 flex overflow-hidden rounded-2xl shadow-lg shadow-deep/10" role="list" aria-label="SOL and MAR color palette">
                  {PALETTE.map((c) => (
                    <div
                      key={c.hex}
                      role="listitem"
                      className="group relative h-16 flex-1 transition-all duration-300 hover:flex-[1.8]"
                      style={{ background: c.hex }}
                      title={`${c.name} — ${c.hex} · ${c.role}`}
                    >
                      <span className="absolute inset-x-0 bottom-1 hidden text-center font-mono text-[9px] font-bold text-deep/70 group-hover:block">
                        {c.hex}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-ink/50">
                  Hover a stripe to reveal its hex — blues ~60%, yellows ~20%, white and sand ~20%.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
