import { MeshBg } from "@/components/effects/MeshBg";
import { GrainOverlay } from "@/components/effects/GrainOverlay";
import { LoginForm } from "@/components/sections/LoginForm";

export const metadata = { title: "Entrar · Calendario Edu" };

const ERROR_MESSAGES: Record<string, string> = {
  "no-autorizado":
    "Tu correo no está autorizado para usar este calendario. Es de uso personal.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] ?? null : null;

  return (
    <>
      <MeshBg />
      <GrainOverlay />
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="glass max-w-[420px] w-full p-[clamp(24px,3vw,36px)] relative z-10">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--color-text-soft)] mb-3">
            Calendario Edu · acceso restringido
          </p>
          <h1 className="text-[28px] font-extrabold tracking-[-0.03em] leading-tight mb-1">
            Entra a tu calendario
          </h1>
          <p className="font-serif italic text-[15px] text-[color:var(--color-text-soft)] mb-7">
            Solo el dueño del calendario puede acceder.
          </p>
          {errorMessage && (
            <p className="mb-4 text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errorMessage}
            </p>
          )}
          <LoginForm next={next} />
        </div>
      </main>
    </>
  );
}
