import { MeshBg } from "@/components/effects/MeshBg";
import { GrainOverlay } from "@/components/effects/GrainOverlay";
import { LoginForm } from "@/components/sections/LoginForm";

export const metadata = { title: "Entrar · Calendario Edu" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; sent?: string }>;
}) {
  return (
    <>
      <MeshBg />
      <GrainOverlay />
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="glass max-w-[420px] w-full p-[clamp(24px,3vw,36px)] relative z-10">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--color-text-soft)] mb-3">
            Calendario Edu
          </p>
          <h1 className="text-[28px] font-extrabold tracking-[-0.03em] leading-tight mb-1">
            Entra para ver tu calendario
          </h1>
          <p className="font-serif italic text-[15px] text-[color:var(--color-text-soft)] mb-7">
            Te enviamos un enlace mágico al correo.
          </p>
          <LoginFormWrapper searchParams={searchParams} />
        </div>
      </main>
    </>
  );
}

async function LoginFormWrapper({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; sent?: string }>;
}) {
  const { next, sent } = await searchParams;
  return <LoginForm next={next} sent={sent === "1"} />;
}
