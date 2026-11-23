# SOL & MAR — v2

> **Uma viagem, não uma página. A scroll journey through one day at the shore.**

Where the sun meets the sea. SOL & MAR v2 is one continuous journey: a living GLSL ocean behind everything, a sun that travels the sky as you scroll (dawn → noon → golden hour → dusk → bioluminescent night), and three full-screen instruments you play with your hands. Built as a professional portfolio piece, not a template.

v1 was a SKY & BLOOM sibling with different colours — and was rejected for exactly that. v2 was rebuilt from scratch: no card grid, no modals, no editorial About, no playground stations.

**Live:** https://sol-e-mar-zeta.vercel.app
**Repo:** https://github.com/LucaswBohrer/sol-e-mar

---

## Concept

A website that feels less like a document and more like a place: salt air, golden light, waves that answer when you arrive. One scroll journey — a shader hero, a velocity marquee, three full-screen labs (MARÉ, SOL, ONDA), a kinetic manifesto with a horizontal drift stretch, and a minimal contact finale.

No client work is invented. Every effect is explicitly presented as a demonstration created by SOL & MAR itself.

## Visual identity

Deep-ocean night as the base, electric blue, and yellow as a hot neon sun — much higher contrast and saturation than v1's pale daytime look.

| Color             | HEX     | Role                  |
| ----------------- | ------- | --------------------- |
| Noite Oceânica    | #04101F | Base background       |
| Azul Profundo     | #062A44 | Text & contrast       |
| Azul Mar          | #0E5A8A | Primary sea           |
| Azul Elétrico     | #2E9BFF | Energy & glow         |
| Azul Céu          | #4DB2E8 | Sky & highlights      |
| Amarelo Sol       | #FFC93C | Neon sun & highlights |
| Âmbar Pôr do Sol  | #FF9F1C | Sunset warmth         |
| Brasa             | #FF6E28 | Extreme sun heat      |

**Typography:** Space Grotesk (display), Inter (body/UI), Cormorant Garamond (editorial italics) — loaded via `next/font/google`.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-first theme tokens in `src/app/globals.css`)
- **Motion** for scroll, springs, velocity and micro-interactions
- **Raw WebGL GLSL shader** for the ocean + sun (no Three.js scene in v2; the shader renders on a fixed canvas and falls back to a static gradient)
- **Lucide React** for icons

No backend, no paid services, no environment variables required.

## Features

- **Shader hero** — full-screen custom GLSL ocean + sun: animated waves, sun glow and reflection column, mouse-reactive distortion, click ripples, stars and bioluminescence at night. Reduced motion = one static frame.
- **Scroll day-cycle** — as you scroll, the sun arcs across the sky and the whole site morphs dawn → noon → golden hour → dusk → night. The top bar always shows the live phase and hour.
- **Global interaction layer** — the pointer is light on water: moving ripples the shader, clicking bursts droplets + expanding rings, dragging draws water. Works on touch too.
- **Kinetic type** — giant "SOL & MAR" chars spring in one by one, stretch with scroll velocity and bend away from the pointer (direct DOM transforms on the hot path, no per-frame React re-renders).
- **Velocity marquee** — speed and direction follow scroll velocity; scroll up and it runs backwards.
- **MARÉ (Lab 01)** — full-screen sticky lab: drag vertically to raise/lower the tide; the water climbs over the type. Keyboard-accessible slider mirrors the same value.
- **SOL (Lab 02)** — full-screen sticky lab: drag the sun across the sky from 06:00 to 21:00; light, colour and hour follow.
- **ONDA (Lab 03)** — wave synth: draw waves with the pointer, wind/speed sliders reshape the field live, and a "modo psicodélico" toggle pushes hue-shift and saturation across the whole site (shader included).
- **Manifesto** — three huge scroll-revealed lines, then a horizontal drift stretch where words slide sideways with the scroll.
- **Motion system** — springs everywhere, magnetic buttons, parallax at different depths, scroll-velocity effects. `prefers-reduced-motion` is respected everywhere (shaders, velocity and marquee go static).
- **SEO** — custom sun favicon, `theme-color`, `robots.txt` and `sitemap.xml`.
- **Contact** — one magnetic `mailto:` button + social links + minimal footer. No backend, nothing simulated.
- **Responsive** — mobile-first, every interaction works by touch, no horizontal overflow, touch-sized targets. **Accessible** — semantic HTML, skip link, visible focus, labelled controls, keyboard-operable sliders and toggle.

## Project structure

```
sol-e-mar/
├── public/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # fonts, metadata, SEO
│   │   ├── page.tsx          # journey orchestration (day-cycle)
│   │   ├── globals.css       # Tailwind v4 theme + palette tokens
│   │   └── loading.tsx
│   ├── components/
│   │   ├── journey/          # OceanShader, RippleLayer, KineticTitle,
│   │   │                     # VelocityMarquee, TideLab, SunLab, WaveLab,
│   │   │                     # Manifesto, TopBar, Footer
│   │   └── ui/               # MagneticButton
│   ├── animations/           # shared easing / durations
│   └── lib/                  # palette, socials, journey types
├── README.md
├── package.json
└── tsconfig.json
```

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint       # ESLint
npm start          # serve the production build
```

Requirements: Node.js 20+ and npm.

## Environment variables

None. Contact uses `mailto:` by design.

## Deploy

Production runs on Vercel (`sol-e-mar-zeta.vercel.app`), connected to this repository — every push to `main` deploys automatically. Framework preset: Next.js. No build settings or env vars needed.

## Known limitations

- The shader is decorative and GPU-bound; on very low-end devices it renders a static gradient background instead.
- The contact button needs a mail client configured on the visitor's device.
- Animations were verified via build + served HTML, not by watching every interaction render in a real browser.
- Lighthouse scores are targets to measure in production, not claims made here.
