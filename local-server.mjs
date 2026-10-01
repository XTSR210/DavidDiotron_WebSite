/**
 * Base de l'atelier — le PC (ou le Mac) de l'artiste fait office de base de données.
 *
 * Ce petit serveur (aucune dépendance) tourne sur l'ordinateur de l'atelier
 * et permet à l'espace Atelier (/admin) d'écrire directement les œuvres sur
 * le disque : data/artworks.json + public/artworks/*. La mise en ligne se fait
 * avec le bouton « Publier » (un commit + push git).
 *
 * Connexion :
 *   - le mot de passe n'est écrit nulle part en clair : seule son empreinte
 *     (scrypt + sel) est enregistrée dans data/.atelier-auth.json, fichier
 *     propre à cet ordinateur et jamais publié ;
 *   - premier lancement (pas encore de mot de passe) : l'espace Atelier
 *     propose d'en créer un ;
 *   - mot de passe oublié : l'espace Atelier demande un code à 6 chiffres,
 *     qui s'affiche UNIQUEMENT dans la fenêtre de ce serveur. Le voir prouve
 *     qu'on est devant l'ordinateur de l'atelier ;
 *   - en dépannage, depuis un terminal : `npm run atelier:mdp`.
 *
 * Sécurité : écoute uniquement sur 127.0.0.1 ; seuls le site de l'atelier
 * (localhost) et le site en ligne peuvent l'appeler depuis un navigateur ;
 * sessions de 12 h ; tentatives limitées.
 *
 * Lancement : node local-server.mjs   (ou atelier.bat / atelier.command)
 */
import http from "node:http";
import crypto from "node:crypto";
import readline from "node:readline";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);
const scrypt = promisify(crypto.scrypt);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3311;
const DATA_FILE = path.join(__dirname, "data", "artworks.json");
const AUTH_FILE = path.join(__dirname, "data", ".atelier-auth.json");
const ARTWORKS_DIR = path.join(__dirname, "public", "artworks");
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);
const MAX_BODY = 40 * 1024 * 1024; // 40 Mo (photos base64)

const MIN_PASSWORD = 8;
const SESSION_MS = 12 * 60 * 60 * 1000;
const CODE_MS = 10 * 60 * 1000;
const MAX_FAILURES = 5;
const LOCK_MS = 10 * 60 * 1000;

/** Sites autorisés à appeler la base depuis un navigateur. */
const ALLOWED_ORIGINS = [
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
  // Site en ligne (Vercel). Adresses exactes : un autre projet Vercel ne passe pas.
  /^https:\/\/david-drioton\.vercel\.app$/i,
];

/* ------------------------------------------------------------------ */
/* Mot de passe                                                        */
/* ------------------------------------------------------------------ */

async function readAuth() {
  try {
    return JSON.parse(await fs.readFile(AUTH_FILE, "utf8"));
  } catch {
    return null;
  }
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return { salt: salt.toString("hex"), hash: hash.toString("hex"), updatedAt: new Date().toISOString() };
}

async function writePassword(password) {
  await fs.mkdir(path.dirname(AUTH_FILE), { recursive: true });
  await fs.writeFile(AUTH_FILE, JSON.stringify(await hashPassword(password), null, 2) + "\n", {
    encoding: "utf8",
    mode: 0o600,
  });
}

async function checkPassword(password) {
  const auth = await readAuth();
  if (!auth || typeof password !== "string") return false;
  const hash = await scrypt(password, Buffer.from(auth.salt, "hex"), 64);
  return crypto.timingSafeEqual(hash, Buffer.from(auth.hash, "hex"));
}

function passwordProblem(password) {
  if (typeof password !== "string" || password.length < MIN_PASSWORD) {
    return `Le mot de passe doit faire au moins ${MIN_PASSWORD} caractères.`;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Sessions, tentatives, code de réinitialisation                      */
/* ------------------------------------------------------------------ */

const sessions = new Map(); // jeton -> expiration (ms)
let failures = 0;
let lockedUntil = 0;
let resetCode = null; // { code, expires, tries }

function newSession() {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, Date.now() + SESSION_MS);
  return token;
}

function sessionOf(req) {
  const m = /^Bearer ([a-f0-9]{64})$/.exec(req.headers.authorization ?? "");
  if (!m) return null;
  const expires = sessions.get(m[1]);
  if (!expires || expires < Date.now()) {
    sessions.delete(m[1]);
    return null;
  }
  return m[1];
}

function lockMessage() {
  const min = Math.ceil((lockedUntil - Date.now()) / 60000);
  return `Trop d'essais. Réessayez dans ${min} minute${min > 1 ? "s" : ""}.`;
}

function failed() {
  failures++;
  if (failures >= MAX_FAILURES) {
    lockedUntil = Date.now() + LOCK_MS;
    failures = 0;
  }
}

function printResetCode(code) {
  const line = "=".repeat(52);
  console.log(`\n${line}\n  CODE DE RÉINITIALISATION DE L'ATELIER :  ${code}\n`);
  console.log("  Saisissez-le dans l'espace Atelier (valable 10 min).");
  console.log(`  Vous n'avez rien demandé ? Ignorez ce message.\n${line}\n`);
}

/* ------------------------------------------------------------------ */
/* HTTP                                                                */
/* ------------------------------------------------------------------ */

function send(res, status, obj) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(obj));
}

function originAllowed(origin) {
  return !origin || ALLOWED_ORIGINS.some((re) => re.test(origin));
}

function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && originAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    // Chrome : autorise le site en ligne à joindre cet ordinateur.
    res.setHeader("Access-Control-Allow-Private-Network", "true");
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error("Fichier trop volumineux (max 40 Mo)."));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function publish() {
  const out = [];
  const g = async (args) => {
    const { stdout } = await execFileP("git", args, {
      cwd: __dirname,
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    });
    return stdout.trim();
  };

  await g(["add", "-A", "--", "data/artworks.json", "public/artworks"]);
  let hasChanges = true;
  try {
    await g(["diff", "--cached", "--quiet"]);
    hasChanges = false;
  } catch {
    /* exit 1 = il y a des changements */
  }
  if (hasChanges) {
    out.push(await g(["commit", "-m", "Galerie mise à jour depuis l'atelier"]));
  } else {
    out.push("Rien de nouveau à publier — la galerie est déjà à jour.");
  }
  try {
    out.push(await g(["push", "origin", "main"]));
  } catch {
    // Le dépôt distant a peut-être avancé (mises à jour du site) :
    // on réaligne puis on retente une fois.
    out.push(await g(["pull", "--rebase", "origin", "main"]));
    out.push(await g(["push", "origin", "main"]));
  }
  return out.join("\n");
}

const server = http.createServer(async (req, res) => {
  cors(req, res);
  // Un site non autorisé ne reçoit rien (protection contre les pages piégées).
  if (!originAllowed(req.headers.origin)) {
    return send(res, 403, { ok: false, error: "Origine non autorisée." });
  }
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url ?? "/", "http://localhost");

  try {
    // Sonde : la base répond-elle, et un mot de passe existe-t-il ?
    if (req.method === "GET" && url.pathname === "/health") {
      return send(res, 200, { ok: true, mode: "pc", configured: Boolean(await readAuth()) });
    }

    if (req.method !== "POST") {
      return send(res, 404, { ok: false, error: "Route inconnue." });
    }

    const body = JSON.parse((await readBody(req)) || "{}");

    /* ------------------------------------------ connexion ---- */
    if (url.pathname === "/api/setup") {
      if (await readAuth()) {
        return send(res, 409, { ok: false, error: "Un mot de passe existe déjà." });
      }
      const problem = passwordProblem(body.password);
      if (problem) return send(res, 400, { ok: false, error: problem });
      await writePassword(body.password);
      console.log("Mot de passe de l'atelier créé.");
      return send(res, 200, { ok: true, token: newSession() });
    }

    if (url.pathname === "/api/login") {
      if (Date.now() < lockedUntil) return send(res, 429, { ok: false, error: lockMessage() });
      if (!(await readAuth())) {
        return send(res, 409, { ok: false, error: "Aucun mot de passe : créez-en un." });
      }
      if (!(await checkPassword(body.password))) {
        failed();
        return send(res, 401, { ok: false, error: "Mot de passe incorrect." });
      }
      failures = 0;
      return send(res, 200, { ok: true, token: newSession() });
    }

    if (url.pathname === "/api/reset/start") {
      if (Date.now() < lockedUntil) return send(res, 429, { ok: false, error: lockMessage() });
      const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
      resetCode = { code, expires: Date.now() + CODE_MS, tries: 0 };
      printResetCode(code);
      return send(res, 200, { ok: true });
    }

    if (url.pathname === "/api/reset/finish") {
      if (Date.now() < lockedUntil) return send(res, 429, { ok: false, error: lockMessage() });
      if (!resetCode || resetCode.expires < Date.now()) {
        resetCode = null;
        return send(res, 400, { ok: false, error: "Code expiré : demandez-en un nouveau." });
      }
      if (String(body.code ?? "").trim() !== resetCode.code) {
        resetCode.tries++;
        if (resetCode.tries >= 5) resetCode = null;
        failed();
        return send(res, 401, { ok: false, error: "Code incorrect." });
      }
      const problem = passwordProblem(body.password);
      if (problem) return send(res, 400, { ok: false, error: problem });
      await writePassword(body.password);
      resetCode = null;
      failures = 0;
      sessions.clear(); // les anciennes sessions ne valent plus rien
      console.log("Mot de passe de l'atelier remplacé.");
      return send(res, 200, { ok: true, token: newSession() });
    }

    /* ------------------------- tout le reste : session obligatoire ---- */
    const token = sessionOf(req);
    if (!token) {
      return send(res, 401, { ok: false, error: "Session expirée : reconnectez-vous." });
    }

    if (url.pathname === "/api/logout") {
      sessions.delete(token);
      return send(res, 200, { ok: true });
    }

    if (url.pathname === "/api/read") {
      const text = await fs.readFile(DATA_FILE, "utf8");
      return send(res, 200, { ok: true, artworks: JSON.parse(text) });
    }

    if (url.pathname === "/api/save") {
      const artworks = body.artworks;
      const images = body.images ?? {};
      if (!Array.isArray(artworks)) {
        return send(res, 400, { ok: false, error: "Liste d'œuvres invalide." });
      }
      // Écrit d'abord les images (fichiers sûrs : nom de base + extension contrôlée).
      if (images && typeof images === "object") {
        await fs.mkdir(ARTWORKS_DIR, { recursive: true });
        for (const [name, b64] of Object.entries(images)) {
          const safe = path.basename(String(name));
          const ext = (safe.split(".").pop() || "").toLowerCase();
          if (!ALLOWED_EXT.has(ext)) {
            return send(res, 400, { ok: false, error: `Type d'image non autorisé : .${ext}` });
          }
          if (typeof b64 !== "string" || b64.length === 0) {
            return send(res, 400, { ok: false, error: `Image vide : ${safe}` });
          }
          await fs.writeFile(path.join(ARTWORKS_DIR, safe), Buffer.from(b64, "base64"));
        }
      }
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(artworks, null, 2) + "\n", "utf8");
      return send(res, 200, { ok: true, saved: artworks.length });
    }

    if (url.pathname === "/api/publish") {
      try {
        return send(res, 200, { ok: true, message: await publish() });
      } catch (e) {
        return send(res, 500, {
          ok: false,
          error:
            "Publication bloquée. " +
            (e.stderr ? String(e.stderr).split("\n").slice(-3).join(" ") : e.message),
        });
      }
    }

    return send(res, 404, { ok: false, error: "Route inconnue." });
  } catch (e) {
    return send(res, 500, { ok: false, error: e.message || String(e) });
  }
});

/* ------------------------------------------------------------------ */
/* Dépannage en ligne de commande : npm run atelier:mdp                */
/* ------------------------------------------------------------------ */

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let muted = false;
    rl._writeToOutput = (s) => {
      if (!muted) process.stdout.write(s);
      else if (s.includes("\n")) process.stdout.write("\n");
      else process.stdout.write("•".repeat(s.length));
    };
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
    muted = true;
  });
}

if (process.argv.includes("--set-password")) {
  const first = await askHidden("Nouveau mot de passe de l'atelier : ");
  const problem = passwordProblem(first);
  if (problem) {
    console.error(problem);
    process.exit(1);
  }
  const second = await askHidden("Encore une fois : ");
  if (first !== second) {
    console.error("Les deux saisies sont différentes : rien n'a changé.");
    process.exit(1);
  }
  await writePassword(first);
  console.log("Mot de passe enregistré : il sert dès la prochaine connexion.");
  process.exit(0);
}

server.listen(PORT, "127.0.0.1", async () => {
  console.log(`Base de l'atelier : http://localhost:${PORT}`);
  console.log(
    (await readAuth())
      ? "Mot de passe configuré. Laissez cette fenêtre ouverte pendant que vous travaillez."
      : "Aucun mot de passe : ouvrez l'espace Atelier pour en créer un."
  );
});
