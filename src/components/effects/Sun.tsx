"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

type SunProps = {
  size?: number;
  /** 0 = sun touching the horizon (golden hour), 1 = high midday sun */
  height?: number;
  interactive?: boolean;
  className?: string;
  label?: string;
};

/**
 * The Sun: an SVG sun that rises and sets over stylised waves.
 * `height` can be driven by scroll, by a slider, or by click (interactive).
 */
export function Sun({
  size = 240,
  height = 1,
  interactive = false,
  className = "",
  label = "Sun rising and setting over the sea — click to raise or lower it",
}: SunProps) {
  const reduce = useReducedMotion();
  const [high, setHigh] = useState(true);
  const h = interactive ? (high ? 0.92 : 0.12) : height;
  const t = reduce ? 1 : h;
  // Sun centre travels from the horizon (y=150) up to mid-sky (y=62).
  const sunY = 150 - t * 88;
  const rayOpacity = 0.35 + t * 0.65;
  const glowOpacity = 0.25 + t * 0.45;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={interactive ? high : undefined}
      onClick={interactive ? () => setHigh((v) => !v) : undefined}
      className={`${interactive ? "cursor-pointer" : "cursor-default"} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        role="img"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFC93C" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#FF9F1C" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FF9F1C" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* glow follows the sun */}
        <motion.circle
          cx={100}
          cy={sunY}
          r={62}
          fill="url(#sun-glow)"
          animate={{ opacity: glowOpacity }}
          transition={{ duration: 0.6 }}
        />
        {/* rays — drawn around the sun centre, rotating slowly in place */}
        <g transform={`translate(100 ${sunY})`}>
        <motion.g
          animate={{ rotate: 360, opacity: rayOpacity }}
          transition={{ rotate: { duration: 60, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.6 } }}
          style={{ transformOrigin: "0px 0px" }}
        >
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            const x1 = Math.cos(a) * 44;
            const y1 = Math.sin(a) * 44;
            const x2 = Math.cos(a) * 56;
            const y2 = Math.sin(a) * 56;
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FF9F1C" strokeWidth="4" strokeLinecap="round" />
            );
          })}
        </motion.g>
        </g>
        {/* sun disc */}
        <motion.circle
          cx={100}
          cy={sunY}
          r={30}
          fill="#FFC93C"
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        />
        <circle cx={100} cy={sunY} r={30} fill="none" stroke="#FF9F1C" strokeWidth="2" opacity="0.5" />
        {/* sea waves */}
        <path d="M10 168 Q25 160 40 168 T70 168 T100 168 T130 168 T160 168 T190 168" fill="none" stroke="#0E5A8A" strokeWidth="4" strokeLinecap="round" />
        <path d="M20 184 Q35 177 50 184 T80 184 T110 184 T140 184 T170 184" fill="none" stroke="#4DB2E8" strokeWidth="4" strokeLinecap="round" />
        <path d="M55 156 Q70 149 85 156 T115 156 T145 156" fill="none" stroke="#7CC8F0" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      </svg>
      {interactive && <span className="sr-only">Toggle the sun between midday and golden hour</span>}
    </button>
  );
}
