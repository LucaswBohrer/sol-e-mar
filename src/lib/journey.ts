import type { MotionValue } from "motion/react";

/** Shared live values for the whole scroll journey. Nothing here causes
 *  React re-renders on the hot path — components read these values inside
 *  rAF loops, shader frames and useMotionValueEvent handlers. */
export type Journey = {
  /** 0 → 1 across the whole page scroll (smoothed). */
  progress: MotionValue<number>;
  /** Scroll velocity (smoothed). */
  velocity: MotionValue<number>;
  /** Sun position in viewport units: x 0.08 → 0.92, y arc (low → high → low). */
  sunX: MotionValue<number>;
  sunY: MotionValue<number>;
  /** 0 = day, 1 = night with bioluminescence. */
  night: MotionValue<number>;
  /** 0 = natural, 1 = full psychedelic hue-shift. Driven by the ONDA lab. */
  psyche: MotionValue<number>;
  /** Global hue rotation in degrees (0–359). Driven by the HueTrip dial;
   *  the shader, aurora, plankton and the <main> filter all follow it. */
  hue: MotionValue<number>;
};

export const PHASES = [
  { at: 0, label: "amanhecer", time: "06:00" },
  { at: 0.25, label: "meio-dia", time: "12:00" },
  { at: 0.5, label: "hora dourada", time: "17:40" },
  { at: 0.75, label: "crepúsculo", time: "19:20" },
  { at: 0.95, label: "noite viva", time: "23:00" },
] as const;

export function phaseFor(p: number): (typeof PHASES)[number] {
  let current: (typeof PHASES)[number] = PHASES[0];
  for (const phase of PHASES) {
    if (p >= phase.at) current = phase;
  }
  return current;
}
