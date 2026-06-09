import { Reveal } from "@/components/effects/Reveal";
import { SplitReveal } from "@/components/effects/SplitReveal";
import { fmtHours } from "@/lib/format";
import type { Role } from "@/lib/auth";

interface Props {
  totals: { sessions: number; hours: number; courses: number };
  userEmail?: string | null;
  role?: Role | null;
}

export function Header({ totals, userEmail, role }: Props) {
  const roleBadge =
    role === "owner" ? "Dueño" : role === "viewer" ? "Lectura" : null;

  return (
    <header className="mb-[clamp(28px,4vw,48px)] flex items-start justify-between gap-6 flex-wrap">
      <div>
        <Reveal delay={0.08} y={14} duration={0.7}>
          <p className="inline-flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[color:var(--color-text-soft)] mb-3.5">
            <span aria-hidden="true" className="inline-block h-px w-[22px] bg-current opacity-45" />
            {totals.sessions} sesiones · {fmtHours(totals.hours)} horas · {totals.courses} cursos
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
            Compromisos docentes · Mayo a octubre de 2026
          </p>
        </Reveal>
      </div>

      {userEmail && (
        <Reveal delay={0.6} y={10} duration={0.7}>
          <div className="flex items-center gap-2 flex-wrap">
            {roleBadge && (
              <span className="rounded-full bg-zinc-900 text-white px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.05em]">
                {roleBadge}
              </span>
            )}
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-text-soft)] hidden sm:inline">
              {userEmail}
            </span>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-full bg-white/70 border border-[color:var(--border-glass-strong)] px-3.5 py-1.5 text-[12px] font-semibold text-[color:var(--color-ink)] backdrop-blur-md transition-colors duration-200 hover:bg-white"
              >
                Salir
              </button>
            </form>
          </div>
        </Reveal>
      )}
    </header>
  );
}
