import "server-only";
import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var _sql: ReturnType<typeof postgres> | undefined;
}

function make() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no configurado");
  return postgres(url, {
    ssl: { rejectUnauthorized: false },
    max: 5,
    idle_timeout: 20,
    connect_timeout: 15,
  });
}

// Reusar la conexión entre invocaciones (evita agotar el pool en serverless).
export const sql = globalThis._sql ?? make();
if (process.env.NODE_ENV !== "production") globalThis._sql = sql;
