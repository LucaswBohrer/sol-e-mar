# SOL & MAR

> **An immersive creative web experience about sun, sea, waves and golden hour.**

Where the sun meets the sea. SOL & MAR is a living shoreline — golden light, rolling waves and motion you can actually touch. Built as a professional portfolio piece, not a template. A sibling of SKY & BLOOM, in a new theme: blues in many shades, warmed by the yellow of the sun.

**Live:** https://sol-e-mar.vercel.app
**Repo:** https://github.com/LucaswBohrer/sol-e-mar

---

## Concept

A website that feels less like a document and more like a place: salt air, golden light, waves that answer when you arrive. Five sections tell one story — a hero that opens the shoreline, three live experiments, a hands-on playground, an editorial about-section, and a contact finale.

No client work is invented. Every experiment is explicitly presented as a demonstration created by SOL & MAR itself.

## Visual identity

| Color             | HEX     | Role                  |
| ----------------- | ------- | --------------------- |
| Azul Profundo     | #062A44 | Text & contrast       |
| Azul Mar          | #0E5A8A | Primary sea           |
| Azul Céu          | #4DB2E8 | Sky & highlights      |
| Azul Gelo         | #E8F4FC | Secondary backgrounds |
| Amarelo Sol       | #FFC93C | Sun & highlights      |
| Âmbar Pôr do Sol  | #FF9F1C | Sunset warmth         |
| Areia             | #F6E7C1 | Warm surfaces         |
| Espuma Branca     | #F8FCFF | Predominant background|

Rough visual distribution: blues ~60%, yellows ~20%, white/sand ~20%.

**Typography:** Space Grotesk (display), Inter (body/UI), Cormorant Garamond (editorial italics) — loaded via `next/font/google`.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-first theme tokens in `src/app/globals.css`)
- **Motion** (Framer Motion successor) for entrance, scroll and micro-interactions
- **Three.js** + **React Three Fiber** + **Drei** for the hero's golden sun and floating sea universe (lazy-loaded, `ssr: false`)
- **Lucide React** for icons

No backend, no paid services, no environment variables required.

## Features

- **Hero 2.0** — cinematic centered composition, giant display type with a serif-italic gradient accent (amber → sun → sky → sea), full-bleed 3D scene with pointer parallax, scroll-driven scale/fade, floating interactive sun, honest stats row, and a scroll cue with a travelling dot.
- **Navigation** — scroll progress bar and scroll-spy underline that follows the section in view.
- **Marquee** — editorial word strip between hero and experiments (pauses on hover and on reduced motion).
- **Experiments** — asymmetric editorial grid with 3 original, functional demos, each with a detail modal:
  1. **Física das Ondas** — canvas waves in three layers with wind + pointer swell. The detail view adds a wind slider and an "Enviar uma onda" button that sends a travelling wave across the sea.
  2. **Laboratório do Pôr do Sol** — live sunset lab with sun-height and warmth sliders, three presets (Manhã no Mar, Pôr do Sol Dourado, Maré Azul), linear/radial toggle, and copyable CSS.
  3. **Tipo Maré** — the letters of MARÉ orbiting your pointer, rendered with direct DOM transforms (no per-frame React re-renders).
- **Playground** — four working stations + global reset:
  - **Color Playground** — mix background / accent / text from the palette, three one-tap presets, live preview, copyable hex + CSS.
  - **Floating Universe** — 2D canvas sea bubbles at different depths, pointer & touch reactive.
  - **Interactive Shapes** — tap to cycle color, scale and rotation; shuffle all.
  - **Sun** — slider-driven sun that rises from the horizon to midday (also scroll-driven in About).
- **About** — editorial narrative, scroll-driven rising sun, and an interactive palette strip (hover a stripe to reveal its hex).
- **Motion system** — one shared easing, three durations and one stagger (`src/animations/motion.ts`); every section header uses the same `SectionHeading` component. `prefers-reduced-motion` is respected everywhere; cursor trail and hover effects are disabled on touch devices.
- **SEO** — custom sun favicon, `theme-color`, `robots.txt` and `sitemap.xml`.
- **Contact** — form + social links + full footer. The form has **no backend**: submitting composes a real email in the visitor's mail client (`mailto:`). Nothing is simulated.
- **Responsive** — mobile-first, hamburger nav, no horizontal overflow, touch-sized targets. **Accessible** — semantic HTML, skip link, visible focus, labelled controls, keyboard-closable modal.

## Project structure

```
sol-e-mar/
├── public/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # fonts, metadata, SEO
│   │   ├── page.tsx          # section composition
│   │   ├── globals.css       # Tailwind v4 theme + palette tokens
│   │   └── loading.tsx
│   ├── components/
│   │   ├── navigation/       # Navbar
│   │   ├── hero/             # Hero
│   │   ├── experiments/      # Gallery + WaveCanvas, SunsetLab, TideType
│   │   ├── playground/       # Playground + FloatingUniverse2D
│   │   ├── about/            # About
│   │   ├── contact/          # Contact + footer
│   │   ├── effects/          # Sun, FloatingUniverse3D, CursorTrail
│   │   └── ui/               # Reveal, MagneticButton
│   ├── data/                 # experiments content
│   └── lib/                  # palette, socials, nav links
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

None. The contact form uses `mailto:` by design.

### Connecting a real form backend (optional)

To receive messages without opening a mail client, wire the form in
`src/components/contact/Contact.tsx` to a service such as
[Formspree](https://formspree.io) or [Resend](https://resend.com): replace the
`mailto:` submit with a `fetch` POST to the service endpoint and store the
endpoint/key in an environment variable (never commit secrets).

## Deploy

Production runs on Vercel, connected to this repository — every push to `main` deploys automatically. Framework preset: Next.js. No build settings or env vars needed.

## Known limitations

- The 3D hero scene is decorative and loads lazily; on very low-end devices it renders a static gradient background instead.
- The contact form needs a mail client configured on the visitor's device (or a backend, see above).
- Lighthouse scores are targets to measure in production, not claims made here.
