import "server-only";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Formato almacenado: scrypt$<salt_hex>$<hash_hex>
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${buf.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored) return false;
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, hashHex] = parts;
  const hash = Buffer.from(hashHex, "hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  if (buf.length !== hash.length) return false;
  return timingSafeEqual(buf, hash);
}
