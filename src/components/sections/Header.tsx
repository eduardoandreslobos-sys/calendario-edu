import { Reveal } from "@/components/effects/Reveal";
import { SplitReveal } from "@/components/effects/SplitReveal";

export function Header() {
  return (
    <header className="mb-[clamp(28px,4vw,48px)]">
      <Reveal delay={0.08} y={14} duration={0.7}>
        <p className="inline-flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-text-soft)] mb-3.5">
          <span aria-hidden="true" className="inline-block h-px w-[22px] bg-current opacity-45" />
          27 sesiones · 76.7 horas · 4 cursos
        </p>
      </Reveal>

      <h1
        className="text-[clamp(36px,6.5vw,76px)] font-extrabold leading-[0.96] tracking-[-0.038em] m-0 text-[color:var(--color-ink)]"
        style={{ fontVariationSettings: "'wght' 800" }}
      >
        <SplitReveal delay={0.18} stagger={0.12} duration={0.9} by="words">
          Calendario
        </SplitReveal>{" "}
        <span
          className="font-serif italic font-normal tracking-[-0.02em] ml-[0.05em]"
          style={{ fontVariationSettings: "normal" }}
        >
          <SplitReveal delay={0.30} stagger={0.12} duration={0.9} by="words">
            Edu
          </SplitReveal>
        </span>
      </h1>

      <Reveal delay={0.48} y={14} duration={0.8}>
        <p className="font-serif italic text-[clamp(16px,1.9vw,21px)] text-[color:var(--color-text-soft)] mt-3.5 tracking-[-0.005em]">
          Compromisos docentes · Mayo a julio de 2026
        </p>
      </Reveal>
    </header>
  );
}
