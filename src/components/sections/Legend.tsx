import { CATS, CAT_ORDER } from "@/lib/cats";

export function Legend() {
  return (
    <section className="glass flex flex-wrap gap-2 px-[18px] py-3.5 mb-[18px]">
      {CAT_ORDER.map((id) => {
        const c = CATS[id];
        return (
          <span
            key={id}
            className="inline-flex items-center gap-2.5 text-[13px] font-medium text-[color:var(--color-ink)] py-1 pl-1 pr-3 rounded-full transition-colors duration-200 hover:bg-black/5"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{
                background: c.dot,
                boxShadow: "0 0 0 3px rgba(255,255,255,0.5)",
              }}
            />
            {c.name}
          </span>
        );
      })}
    </section>
  );
}
