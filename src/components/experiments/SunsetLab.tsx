"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

const PRESETS = [
  { name: "Manh\u00e3 no Mar", sun: 85, warm: 25, type: "linear" as const },
  { name: "P\u00f4r do Sol Dourado", sun: 18, warm: 85, type: "linear" as const },
  { name: "Mar\u00e9 Azul", sun: 60, warm: 10, type: "radial" as const },
] as const;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${m(r1, r2)}, ${m(g1, g2)}, ${m(b1, b2)})`;
}

/** Live sunset lab: sun height + warmth sliders, presets, linear/radial,
 *  with a copyable CSS snippet. */
export function SunsetLab() {
  const [sun, setSun] = useState(18);
  const [warm, setWarm] = useState(85);
  const [type, setType] = useState<"linear" | "radial">("linear");
  const [copied, setCopied] = useState(false);

  // sun = 0 -> sun on the horizon (deep amber dusk); sun = 100 -> high midday sun.
  const skyTop = useMemo(() => mix("#062A44", "#7CC8F0", sun / 100), [sun]);
  const horizon = useMemo(() => mix("#FF9F1C", "#FFD166", 0.25 + (sun / 100) * 0.6), [sun]);
  const sea = useMemo(() => mix("#041E33", "#0E5A8A", 0.3 + (sun / 100) * 0.7), [sun]);
  const warmGlow = useMemo(() => mix("#FF9F1C", "#FFC93C", warm / 100), [warm]);

  const gradient = useMemo(
    () =>
      type === "linear"
        ? `linear-gradient(180deg, ${skyTop} 0%, ${warmGlow} ${Math.max(18, sun)}%, ${horizon} ${Math.min(88, sun + 32)}%, ${sea} 100%)`
        : `radial-gradient(circle at 50% ${100 - sun}%, ${warmGlow} 0%, ${horizon} ${40 + warm / 4}%, ${sea} 100%)`,
    [type, skyTop, warmGlow, horizon, sea, sun, warm],
  );
  const css = `background: ${gradient};`;

  const hourLabel = sun < 25 ? "Golden hour" : sun < 60 ? "Late afternoon" : sun < 85 ? "Midday light" : "Morning at sea";

  async function copy() {
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative h-36 w-full overflow-hidden rounded-2xl shadow-inner transition-all duration-200 sm:h-44"
        style={{ background: gradient }}
        role="img"
        aria-label="Live sunset preview built from the SOL and MAR palette"
      >
        {/* the sun itself, positioned by the slider */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 size-12 -translate-x-1/2 rounded-full bg-sun shadow-[0_0_40px_12px_rgba(255,201,60,0.55)] transition-all duration-200 sm:size-14"
          style={{ top: `${58 - (sun / 100) * 42}%` }}
        />
        <span className="absolute bottom-2 left-3 rounded-full bg-deep/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {hourLabel}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Sunset presets">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => {
              setSun(p.sun);
              setWarm(p.warm);
              setType(p.type);
            }}
            aria-pressed={sun === p.sun && warm === p.warm && type === p.type}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              sun === p.sun && warm === p.warm && type === p.type
                ? "bg-deep text-white"
                : "bg-ice text-deep hover:bg-sand"
            }`}
          >
            {p.name}
          </button>
        ))}
        <div className="ml-auto flex rounded-full bg-ice p-1" role="group" aria-label="Gradient type">
          {(["linear", "radial"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              aria-pressed={type === t}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                type === t ? "bg-white text-deep shadow" : "text-deep/60"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <label className="block text-sm font-medium text-deep">
          <span className="flex justify-between">
            <span>Altura do sol</span>
            <span className="text-ink/60">{sun}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={sun}
            onChange={(e) => setSun(Number(e.target.value))}
            className="mt-1 w-full accent-[#FF9F1C]"
            aria-label="Sun height"
          />
        </label>
        <label className="block text-sm font-medium text-deep">
          <span className="flex justify-between">
            <span>Calor do p&ocirc;r do sol</span>
            <span className="text-ink/60">{warm}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={warm}
            onChange={(e) => setWarm(Number(e.target.value))}
            className="mt-1 w-full accent-[#FFC93C]"
            aria-label="Sunset warmth"
          />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg bg-ice px-3 py-2 font-mono text-[11px] text-deep">
          {css}
        </code>
        <button
          type="button"
          onClick={copy}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-deep px-4 py-2 text-xs font-semibold text-white"
          aria-label="Copy sunset CSS"
        >
          {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
          {copied ? "Copied" : "Copy CSS"}
        </button>
      </div>
    </div>
  );
}
