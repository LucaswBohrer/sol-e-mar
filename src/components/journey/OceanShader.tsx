"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent } from "motion/react";
import type { Journey } from "@/lib/journey";

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_sun;
uniform float u_night;
uniform float u_psyche;
uniform float u_hue;
uniform vec4 u_ripples[8];

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
vec3 iq(float t) { return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67))); }

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  // ---- pointer ripples: expanding rings that warp the field ----
  float warp = 0.0;
  for (int i = 0; i < 8; i++) {
    vec4 r = u_ripples[i];
    if (r.z > 0.0) {
      float age = u_time - r.z;
      if (age > 0.0 && age < 2.5) {
        float d = distance(p, vec2(r.x * aspect, r.y));
        warp += sin((d - age * 0.35) * 42.0) * exp(-age * 1.5) * exp(-d * 1.4) * r.w;
      }
    }
  }
  float md = distance(p, vec2(u_mouse.x * aspect, u_mouse.y));
  warp += 0.25 * exp(-md * md * 22.0) * sin(u_time * 2.0 + md * 30.0);
  vec2 q = p + warp * 0.05;

  float horizon = 0.54 + 0.018 * sin(q.x * 3.0 + u_time * 0.55) + warp * 0.012;

  // ---- sky: dawn gold -> noon blue -> dusk violet -> night ----
  vec3 skyDay = mix(vec3(0.99, 0.72, 0.30), vec3(0.10, 0.48, 0.92), clamp(u_sun.y * 1.6, 0.0, 1.0));
  vec3 skyDusk = vec3(0.42, 0.16, 0.48);
  vec3 skyNight = vec3(0.012, 0.03, 0.09);
  vec3 sky = mix(mix(skyDay, skyDusk, clamp(1.0 - u_sun.y * 2.2, 0.0, 1.0) * 0.85), skyNight, u_night);
  sky = mix(sky, sky * 0.55 + vec3(0.02, 0.05, 0.12), smoothstep(0.75, 1.0, uv.y) * 0.0);
  // vertical gradient: lighter near horizon
  sky += vec3(0.10, 0.08, 0.02) * (1.0 - abs(uv.y - horizon) * 3.0) * (1.0 - u_night);

  // ---- sun disc + glow ----
  vec2 sunPos = vec2(u_sun.x * aspect, u_sun.y);
  float sd = distance(q, sunPos);
  float disc = 1.0 - smoothstep(0.055, 0.075, sd);
  float glow = exp(-sd * 5.5);
  vec3 sunCol = mix(vec3(1.0, 0.78, 0.24), vec3(1.0, 0.45, 0.10), clamp(1.0 - u_sun.y * 1.8, 0.0, 1.0));
  vec3 col = sky + sunCol * (disc * 1.6 + glow * 0.55) * (1.0 - u_night * 0.75);
  // night: the sun becomes a pale moon
  float moon = 1.0 - smoothstep(0.04, 0.055, sd);
  col += vec3(0.85, 0.9, 1.0) * moon * u_night * 1.2;
  col += vec3(0.7, 0.8, 1.0) * exp(-sd * 9.0) * u_night * 0.5;

  // ---- stars ----
  if (u_night > 0.02) {
    vec2 sp = floor(q * vec2(aspect, 1.0) * 90.0);
    float h = hash(sp);
    float star = step(0.992, h) * (0.5 + 0.5 * sin(u_time * 2.0 + h * 40.0));
    col += vec3(0.9, 0.95, 1.0) * star * u_night * smoothstep(horizon, horizon + 0.12, uv.y);
  }

  // ---- ocean: layered waves, sun reflection, bioluminescence ----
  if (uv.y < horizon) {
    float depth = clamp((horizon - uv.y) / horizon, 0.0, 1.0);
    vec3 deep = vec3(0.008, 0.10, 0.22);
    vec3 shallow = vec3(0.05, 0.45, 0.75);
    vec3 sea = mix(shallow, deep, depth);
    float n1 = noise(vec2(q.x * 7.0, q.y * 16.0 - u_time * 0.9));
    float n2 = noise(vec2(q.x * 15.0 + 4.0, q.y * 30.0 - u_time * 1.6));
    float bands = smoothstep(0.62, 0.95, n1 * 0.7 + n2 * 0.3);
    sea += vec3(0.15, 0.55, 0.8) * bands * 0.35 * (1.0 - depth * 0.5);
    // sun reflection column
    float column = exp(-abs(q.x - sunPos.x) * 7.0);
    float shimmer = 0.55 + 0.45 * noise(vec2(q.x * 24.0, q.y * 40.0 - u_time * 2.2));
    sea += sunCol * column * shimmer * (1.0 - depth) * 0.85 * (1.0 - u_night * 0.6);
    // wave crest foam
    float crest = smoothstep(0.86, 0.99, noise(vec2(q.x * 9.0 + u_time * 0.35, q.y * 22.0)));
    sea += vec3(0.75, 0.9, 1.0) * crest * 0.22 * (1.0 - u_night * 0.5);
    // bioluminescent sparkle at night
    float bio = step(0.985, hash(floor(q * vec2(140.0, 90.0)) + floor(u_time * 1.5)));
    sea += vec3(0.1, 0.9, 0.75) * bio * u_night * (0.5 + 0.5 * sin(u_time * 3.0 + q.x * 20.0));
    col = sea;
    // horizon glow line
    col += sunCol * exp(-abs(uv.y - horizon) * 90.0) * 0.5 * (1.0 - u_night * 0.5);
  }

  // ---- psychedelic hue-shift (ONDA lab toggle) — stronger in v3 ----
  if (u_psyche > 0.01) {
    vec3 shifted = iq(uv.x * 0.8 + uv.y * 0.6 + u_time * 0.06);
    col = mix(col, shifted * (0.55 + 0.45 * length(col)), u_psyche * 0.85);
    col *= 1.0 + u_psyche * 0.4 * sin(uv.y * 28.0 + u_time * 3.0);
  }

  // ---- global hue trip (HueTrip dial): rotate the whole ocean's hue ----
  if (abs(u_hue) > 0.5) {
    float a = radians(u_hue);
    mat3 rot = mat3(
      0.299 + 0.701 * cos(a) + 0.168 * sin(a), 0.587 - 0.587 * cos(a) + 0.330 * sin(a), 0.114 - 0.114 * cos(a) - 0.497 * sin(a),
      0.299 - 0.299 * cos(a) - 0.328 * sin(a), 0.587 + 0.413 * cos(a) + 0.035 * sin(a), 0.114 - 0.114 * cos(a) + 0.292 * sin(a),
      0.299 - 0.300 * cos(a) + 1.250 * sin(a), 0.587 - 0.588 * cos(a) - 1.050 * sin(a), 0.114 + 0.886 * cos(a) - 0.203 * sin(a)
    );
    col = clamp(rot * col, 0.0, 1.0);
  }

  // vignette
  float vig = 1.0 - 0.28 * length((uv - 0.5) * vec2(aspect, 1.0));
  gl_FragColor = vec4(col * clamp(vig, 0.0, 1.0), 1.0);
}
`;

type Ripple = { x: number; y: number; t: number; s: number };

/** Full-screen GLSL ocean + sun. Fixed behind the whole journey; the sun,
 *  night and psychedelic uniforms are driven live by scroll and the labs.
 *  Pointer movement warps the water, clicks drop ripples. */
export function OceanShader({ journey }: { journey: Journey }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    mouse: { x: 0.5, y: 0.4 },
    targetMouse: { x: 0.5, y: 0.4 },
    sun: { x: 0.5, y: 0.6 },
    night: 0,
    psyche: 0,
    hue: 0,
    ripples: [] as Ripple[],
    reduce: false,
  });

  useMotionValueEvent(journey.sunX, "change", (v) => {
    stateRef.current.sun.x = v;
  });
  useMotionValueEvent(journey.sunY, "change", (v) => {
    stateRef.current.sun.y = v;
  });
  useMotionValueEvent(journey.night, "change", (v) => {
    stateRef.current.night = v;
  });
  useMotionValueEvent(journey.psyche, "change", (v) => {
    stateRef.current.psyche = v;
  });
  useMotionValueEvent(journey.hue, "change", (v) => {
    stateRef.current.hue = v;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const st = stateRef.current;
    st.reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    st.sun.x = journey.sunX.get();
    st.sun.y = journey.sunY.get();
    st.night = journey.night.get();

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      canvas.style.display = "none";
      return;
    }

    function compile(type: number, src: string) {
      const sh = gl!.createShader(type);
      if (!sh) return null;
      gl!.shaderSource(sh, src);
      gl!.compileShader(sh);
      if (!gl!.getShaderParameter(sh, gl!.COMPILE_STATUS)) {
        console.warn("SOL&MAR shader compile error:", gl!.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    }
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      canvas.style.display = "none";
      return;
    }
    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.style.display = "none";
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = {
      res: gl.getUniformLocation(prog, "u_res"),
      time: gl.getUniformLocation(prog, "u_time"),
      mouse: gl.getUniformLocation(prog, "u_mouse"),
      sun: gl.getUniformLocation(prog, "u_sun"),
      night: gl.getUniformLocation(prog, "u_night"),
      psyche: gl.getUniformLocation(prog, "u_psyche"),
      hue: gl.getUniformLocation(prog, "u_hue"),
      ripples: gl.getUniformLocation(prog, "u_ripples"),
    };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor(canvas!.clientWidth * dpr);
      const h = Math.floor(canvas!.clientHeight * dpr);
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
        gl!.viewport(0, 0, w, h);
      }
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function onMove(e: PointerEvent) {
      st.targetMouse.x = e.clientX / window.innerWidth;
      st.targetMouse.y = 1 - e.clientY / window.innerHeight;
    }
    function onDown(e: PointerEvent) {
      st.ripples.push({
        x: e.clientX / window.innerWidth,
        y: 1 - e.clientY / window.innerHeight,
        t: performance.now() / 1000,
        s: 1,
      });
      if (st.ripples.length > 8) st.ripples.shift();
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });

    const start = performance.now();
    let raf = 0;
    const rippleData = new Float32Array(8 * 4);

    function frame(now: number) {
      const t = (now - start) / 1000;
      // ease the mouse toward the pointer so the water follows softly
      st.mouse.x += (st.targetMouse.x - st.mouse.x) * 0.06;
      st.mouse.y += (st.targetMouse.y - st.mouse.y) * 0.06;
      // expire old ripples
      st.ripples = st.ripples.filter((r) => t - r.t < 2.5);
      for (let i = 0; i < 8; i++) {
        const r = st.ripples[i];
        rippleData[i * 4] = r ? r.x : 0;
        rippleData[i * 4 + 1] = r ? r.y : 0;
        rippleData[i * 4 + 2] = r ? r.t : -1;
        rippleData[i * 4 + 3] = r ? r.s : 0;
      }
      gl!.uniform2f(U.res, canvas!.width, canvas!.height);
      gl!.uniform1f(U.time, st.reduce ? 12 : t);
      gl!.uniform2f(U.mouse, st.mouse.x, st.mouse.y);
      gl!.uniform2f(U.sun, st.sun.x, st.sun.y);
      gl!.uniform1f(U.night, st.night);
      gl!.uniform1f(U.psyche, st.psyche);
      gl!.uniform1f(U.hue, st.hue);
      gl!.uniform4fv(U.ripples, rippleData);
      gl!.drawArrays(0x0004 /* TRIANGLES */, 0, 3);
      if (!st.reduce) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(180deg,#0a4a7a_0%,#062a44_45%,#04101f_100%)]"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
