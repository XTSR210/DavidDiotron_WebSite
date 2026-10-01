import "server-only";
import crypto from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { readAuth, writeAuth, type AuthRecord } from "./store";

/**
 * Connexion à l'atelier, entièrement sur Vercel.
 *
 * - Mot de passe : empreinte scrypt (jamais en clair), dans le stockage chiffré.
 * - Session : cookie httpOnly signé (HMAC, ATELIER_SECRET), valable 12 h,
 *   lié à la version du mot de passe : en changer déconnecte tout le monde.
 * - Première installation : protégée par ATELIER_SETUP_CODE (variable Vercel).
 * - Mot de passe oublié : clé de secours remise à l'installation.
 */

const scrypt = promisify(crypto.scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export const MIN_PASSWORD = 8;
const COOKIE = "atelier_session";
const SESSION_S = 12 * 60 * 60;
const MAX_FAILURES = 5;
const LOCK_MS = 10 * 60 * 1000;

async function digest(secret: string) {
  const salt = crypto.randomBytes(16);
  return { salt: salt.toString("hex"), hash: (await scrypt(secret, salt, 64)).toString("hex") };
}

async function matches(secret: string, d: { salt: string; hash: string }) {
  const h = await scrypt(secret, Buffer.from(d.salt, "hex"), 64);
  return crypto.timingSafeEqual(h, Buffer.from(d.hash, "hex"));
}

/** Clé de secours lisible : 4 groupes de 4 caractères sans ambiguïté (pas de 0/O, 1/I). */
function newRecoveryKey(): string {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(16);
  const chars = [...bytes].map((b) => abc[b % abc.length]).join("");
  return chars.match(/.{4}/g)!.join("-");
}

const normalizeKey = (k: string) => k.toUpperCase().replace(/[^A-Z0-9]/g, "");

/* -------------------------------------------- limitation des essais ---- */

// Par instance de fonction : freine les essais en rafale, sans base de données.
let failures = 0;
let lockedUntil = 0;

export function lockMessage(): string | null {
  if (Date.now() >= lockedUntil) return null;
  const min = Math.ceil((lockedUntil - Date.now()) / 60000);
  return `Trop d'essais. Réessayez dans ${min} minute${min > 1 ? "s" : ""}.`;
}

async function failed() {
  failures++;
  if (failures >= MAX_FAILURES) {
    lockedUntil = Date.now() + LOCK_MS;
    failures = 0;
  }
  await new Promise((r) => setTimeout(r, 700)); // ralentit chaque mauvais essai
}

/* ------------------------------------------------------- sessions ---- */

function sign(payload: string) {
  return crypto.createHmac("sha256", `atelier-session:${process.env.ATELIER_SECRET}`).update(payload).digest("base64url");
}

async function openSession(record: AuthRecord) {
  const payload = Buffer.from(
    JSON.stringify({ v: record.version, exp: Math.floor(Date.now() / 1000) + SESSION_S })
  ).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_S,
  });
}

export async function closeSession() {
  (await cookies()).delete(COOKIE);
}

/** Vrai si la requête porte une session valide. */
export async function isSignedIn(): Promise<boolean> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw || !process.env.ATELIER_SECRET) return false;
  const [payload, mac] = raw.split(".");
  if (!payload || !mac) return false;
  const expected = sign(payload);
  if (mac.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return false;
  try {
    const { v, exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (exp < Date.now() / 1000) return false;
    const record = await readAuth();
    return Boolean(record && record.version === v);
  } catch {
    return false;
  }
}

/* ---------------------------------------------------- opérations ---- */

function passwordProblem(password: unknown): string | null {
  return typeof password === "string" && password.length >= MIN_PASSWORD
    ? null
    : `Le mot de passe doit faire au moins ${MIN_PASSWORD} caractères.`;
}

export async function configured() {
  return Boolean(await readAuth());
}

/** Première installation : code d'installation + nouveau mot de passe. Renvoie la clé de secours. */
export async function setup(code: unknown, password: unknown): Promise<string> {
  const lock = lockMessage();
  if (lock) throw new Error(lock);
  if (await readAuth()) throw new Error("L'atelier a déjà un mot de passe.");
  const expected = process.env.ATELIER_SETUP_CODE ?? "";
  if (!expected || normalizeKey(String(code ?? "")) !== normalizeKey(expected)) {
    await failed();
    throw new Error("Code d'installation incorrect.");
  }
  const problem = passwordProblem(password);
  if (problem) throw new Error(problem);
  return replace(password as string);
}

export async function login(password: unknown) {
  const lock = lockMessage();
  if (lock) throw new Error(lock);
  const record = await readAuth();
  if (!record) throw new Error("L'atelier n'a pas encore de mot de passe.");
  if (typeof password !== "string" || !(await matches(password, record.password))) {
    await failed();
    throw new Error("Mot de passe incorrect.");
  }
  failures = 0;
  await openSession(record);
}

/** Mot de passe oublié : clé de secours + nouveau mot de passe. Renvoie une NOUVELLE clé de secours. */
export async function reset(recoveryKey: unknown, password: unknown): Promise<string> {
  const lock = lockMessage();
  if (lock) throw new Error(lock);
  const record = await readAuth();
  if (!record) throw new Error("L'atelier n'a pas encore de mot de passe.");
  if (!(await matches(normalizeKey(String(recoveryKey ?? "")), record.recovery))) {
    await failed();
    throw new Error("Clé de secours incorrecte.");
  }
  const problem = passwordProblem(password);
  if (problem) throw new Error(problem);
  return replace(password as string);
}

/** Changement de mot de passe une fois connecté. */
export async function change(current: unknown, password: unknown): Promise<string> {
  const record = await readAuth();
  if (!record || typeof current !== "string" || !(await matches(current, record.password))) {
    await failed();
    throw new Error("Mot de passe actuel incorrect.");
  }
  const problem = passwordProblem(password);
  if (problem) throw new Error(problem);
  return replace(password as string);
}

async function replace(password: string): Promise<string> {
  const recoveryKey = newRecoveryKey();
  const record: AuthRecord = {
    password: await digest(password),
    recovery: await digest(normalizeKey(recoveryKey)),
    version: crypto.randomBytes(8).toString("hex"),
  };
  await writeAuth(record);
  failures = 0;
  await openSession(record);
  return recoveryKey;
}
