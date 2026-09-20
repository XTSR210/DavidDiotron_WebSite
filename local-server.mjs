/**
 * Serveur local de l'atelier — le PC fait office de base de données.
 *
 * Ce petit serveur (aucune dépendance) tourne sur l'ordinateur de
 * l'atelier et permet au panneau /admin d'écrire directement les œuvres
 * sur le disque : data/artworks.json + public/artworks/*. Aucun jeton
 * GitHub n'est nécessaire ; la publication vers le site en ligne se fait
 * avec le bouton « Publier » (un commit + push git).
 *
 * Sécurité : écoute uniquement sur 127.0.0.1, protégé par le mot de passe
 * de l'atelier (le même que le panneau).
 *
 * Lancement : node local-server.mjs   (ou atelier.bat à la racine)
 */
import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileP = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3311;
const PASSWORD = "atelier-2026"; // identique au panneau /admin
const DATA_FILE = path.join(__dirname, "data", "artworks.json");
const ARTWORKS_DIR = path.join(__dirname, "public", "artworks");
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);
const MAX_BODY = 40 * 1024 * 1024; // 40 Mo (photos base64)

function send(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function cors(req, res) {
  const origin = req.headers.origin;
  if (origin) {
    // Site local (localhost:3210) ou site déployé : on renvoie l'origine.
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
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

const server = http.createServer(async (req, res) => {
  cors(req, res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url ?? "/", "http://localhost");

  try {
    // Sonde de disponibilité (sans mot de passe : ne renvoie aucune donnée).
    if (req.method === "GET" && url.pathname === "/health") {
      return send(res, 200, { ok: true, mode: "pc" });
    }

    if (req.method !== "POST") {
      return send(res, 404, { ok: false, error: "Route inconnue." });
    }

    const body = JSON.parse((await readBody(req)) || "{}");
    if (body.pw !== PASSWORD) {
      return send(res, 401, { ok: false, error: "Mot de passe incorrect." });
    }

    /* -------------------------------------------------- lecture ---- */
    if (url.pathname === "/api/read") {
      const text = await fs.readFile(DATA_FILE, "utf8");
      return send(res, 200, { ok: true, artworks: JSON.parse(text) });
    }

    /* ------------------------------------------------- écriture ---- */
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

    /* ---------------------------------------------- publication ---- */
    if (url.pathname === "/api/publish") {
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
        out.push(await g(["commit", "-m", "Galerie mise à jour depuis l'atelier (PC)"]));
      } else {
        out.push("Rien de nouveau à publier — la galerie est déjà à jour.");
      }
      try {
        out.push(await g(["push", "origin", "main"]));
        return send(res, 200, { ok: true, message: out.join("\n") });
      } catch {
        // Le dépôt distant a peut-être avancé (mises à jour du site) :
        // on réaligne puis on retente une fois.
        try {
          out.push(await g(["pull", "--rebase", "origin", "main"]));
          out.push(await g(["push", "origin", "main"]));
          return send(res, 200, { ok: true, message: out.join("\n") });
        } catch (e2) {
          return send(res, 500, {
            ok: false,
            error:
              "Publication bloquée. " +
              (e2.stderr ? String(e2.stderr).split("\n").slice(-3).join(" ") : e2.message),
          });
        }
      }
    }

    return send(res, 404, { ok: false, error: "Route inconnue." });
  } catch (e) {
    return send(res, 500, { ok: false, error: e.message || String(e) });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Atelier local (base de données du PC) : http://localhost:${PORT}`);
});
