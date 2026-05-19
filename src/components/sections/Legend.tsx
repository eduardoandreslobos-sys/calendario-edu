"use client";

import { CATS, CAT_ORDER, type CatId } from "@/lib/cats";

interface Props {
  hiddenCats: Set<CatId>;
  onToggle: (id: CatId) => void;
  onShowAll: () => void;
}

export function Legend({ hiddenCats, onToggle, onShowAll }: Props) {
  const anyHidden = hiddenCats.size > 0;

  return (
    <section className="glass flex flex-wrap items-center gap-2 px-[18px] py-3.5 mb-[18px]">
      {CAT_ORDER.map((id) => {
        const c = CATS[id];
        const hidden = hiddenCats.has(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => onToggle(id)}
            aria-pressed={!hidden}
            aria-label={`${hidden ? "Mostrar" : "Ocultar"} ${c.name}`}
            className={`inline-flex items-center gap-2.5 text-[13px] font-medium text-[color:var(--color-ink)] py-1 pl-1 pr-3 rounded-full transition-all duration-200 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-[color:var(--color-ink-soft)] focus-visible:outline-offset-2 cursor-pointer ${
              hidden ? "opacity-40 line-through" : ""
            }`}
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{
                background: c.dot,
                boxShadow: "0 0 0 3px rgba(255,255,255,0.5)",
              }}
            />
            {c.name}
          </button>
        );
      })}
      {anyHidden && (
        <button
          type="button"
          onClick={onShowAll}
          className="ml-auto font-mono text-[10.5px] uppercase tracking-[0.12em] text-[color:var(--color-text-soft)] font-medium px-2.5 py-1 rounded-full transition-colors duration-200 hover:bg-black/5"
        >
          Mostrar todo
        </button>
      )}
    </section>
  );
}
