"use client";

import { ArrowUp, Mail } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { CONTACT_EMAIL, SOCIALS } from "@/lib/site";

/** Minimal contact finale — one magnetic mailto, socials, nothing simulated. */
export function Footer() {
  return (
    <footer id="contato" className="relative z-10 px-5 pt-10 pb-12 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 rounded-[2.5rem] border border-white/15 bg-[#04101f]/60 px-6 py-14 text-center backdrop-blur-md sm:py-20">
        <p className="text-xs font-bold tracking-[0.3em] text-sun uppercase">Fim da viagem — começo da sua</p>
        <h2 className="max-w-2xl font-display text-[clamp(2.4rem,7vw,4.5rem)] leading-[0.95] font-bold tracking-tight text-white text-balance">
          O mar está esperando. <span className="text-gradient-sun">Fala com a gente.</span>
        </h2>
        <MagneticButton
          href={`mailto:${CONTACT_EMAIL}`}
          className="rounded-full bg-sun px-8 py-4 text-base font-bold text-deep shadow-[0_0_50px_rgba(255,201,60,0.35)]"
        >
          <Mail className="size-5" aria-hidden="true" />
          {CONTACT_EMAIL}
        </MagneticButton>
        <nav aria-label="Redes sociais" className="flex flex-wrap items-center justify-center gap-2">
          {SOCIALS.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:border-sun/60 hover:text-sun"
            >
              {s.name} · {s.handle}
            </a>
          ))}
        </nav>
        <p className="max-w-md text-sm leading-relaxed text-white/50">
          SOL &amp; MAR é um laboratório criativo — cada efeito desta página é
          uma demonstração feita pelo próprio site. Nada aqui é trabalho de
          cliente.
        </p>
        <a
          href="#top"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:border-sun/60 hover:text-sun"
        >
          <ArrowUp className="size-4" aria-hidden="true" />
          Voltar ao amanhecer
        </a>
      </div>
      <p className="mt-8 text-center text-xs text-white/40">
        SOL &amp; MAR © 2026 — feito de sol, mar e movimento.
      </p>
    </footer>
  );
}
