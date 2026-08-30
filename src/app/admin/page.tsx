"use client";

import { useEffect, useState } from "react";
import type { Artwork } from "@/lib/types";
import {
  DEFAULT_REPO,
  getFileText,
  putFile,
  toBase64,
} from "@/lib/github";
import { BrushIcon, CanvasCheckIcon } from "@/components/icons";

// Secret d'accès à l'atelier (visible côté client : sert de verrou léger).
const ADMIN_SECRET = "atelier-2026";
const SECRET_KEY = "drioton-admin-secret";
const TOKEN_KEY = "drioton-github-token";
const REPO_KEY = "drioton-github-repo";

const ARTWORKS_PATH = "data/artworks.json";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [secretInput, setSecretInput] = useState("");
  const [authError, setAuthError] = useState("");

  const [token, setToken] = useState("");
  const [repo, setRepo] = useState(DEFAULT_REPO);
  const [connected, setConnected] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [jsonSha, setJsonSha] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Formulaire d'ajout
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [technique, setTechnique] = useState("");
  const [year, setYear] = useState("");
  const [widthCm, setWidthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [priceEur, setPriceEur] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem(SECRET_KEY) === "1") setAuthed(true);
    const t = localStorage.getItem(TOKEN_KEY);
    const r = localStorage.getItem(REPO_KEY);
    if (t) setToken(t);
    if (r) setRepo(r);
  }, []);

  const inputCls =
    "w-full rounded-lg border border-white/15 bg-[var(--ink-soft)] px-3 py-2 text-sm outline-none focus:border-[var(--amber)]";

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (secretInput === ADMIN_SECRET) {
      setAuthed(true);
      sessionStorage.setItem(SECRET_KEY, "1");
      setAuthError("");
    } else {
      setAuthError("Secret incorrect.");
    }
  }

  async function connect() {
    setStatus("");
    setError("");
    setBusy(true);
    try {
      const file = await getFileText(token.trim(), repo.trim(), ARTWORKS_PATH);
      if (!file) throw new Error("data/artworks.json introuvable dans le dépôt.");
      setArtworks(JSON.parse(file.text) as Artwork[]);
      setJsonSha(file.sha);
      setConnected(true);
      localStorage.setItem(TOKEN_KEY, token.trim());
      localStorage.setItem(REPO_KEY, repo.trim());
      setStatus("Connecté ✓ — liste chargée depuis le dépôt.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connexion impossible.");
    } finally {
      setBusy(false);
    }
  }

  function readFileBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        const data = r.result as string;
        resolve(data.split(",")[1] ?? "");
      };
      r.onerror = () => reject(new Error("Lecture de l'image impossible."));
      r.readAsDataURL(file);
    });
  }

  async function addArtwork(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setStatus(""); setBusy(true);
    try {
      if (!imageFile && !imageUrl.trim()) {
        throw new Error("Ajoutez une image (fichier) ou une URL d'image.");
      }
      const t = token.trim();
      const r = repo.trim();
      const id = `art-${Date.now().toString(36)}`;
      let image: string;

      if (imageFile) {
        const ext = (imageFile.name.split(".").pop() || "jpg").toLowerCase();
        const path = `public/artworks/${id}.${ext}`;
        const b64 = await readFileBase64(imageFile);
        await putFile(t, r, path, b64, `Nouvelle œuvre ${id}`);
        image = `/artworks/${id}.${ext}`;
      } else {
        image = imageUrl.trim();
      }

      const artwork: Artwork = {
        id,
        title: title.trim(),
        image,
        technique: technique.trim() || undefined,
        year: year ? Number(year) : undefined,
        widthCm: widthCm ? Number(widthCm) : undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
        priceEur: priceEur ? Number(priceEur) : undefined,
      };

      const next = [...artworks, artwork];
      const newSha = await putFile(
        t,
        r,
        ARTWORKS_PATH,
        toBase64(`${JSON.stringify(next, null, 2)}\n`),
        `Œuvre ajoutée : ${artwork.title}`,
        jsonSha ?? undefined
      );
      setJsonSha(newSha ?? jsonSha);
      setArtworks(next);
      setTitle(""); setImageUrl(""); setImageFile(null);
      setTechnique(""); setYear(""); setWidthCm(""); setHeightCm(""); setPriceEur("");
      setStatus("Œuvre « " + artwork.title + " » ajoutée ✓ — le site se met à jour automatiquement (≈ 2 min).");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ajout impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function removeArtwork(id: string) {
    if (!confirm("Supprimer cette œuvre du dépôt ?")) return;
    setError(""); setStatus(""); setBusy(true);
    try {
      const next = artworks.filter((a) => a.id !== id);
      const newSha = await putFile(
        token.trim(),
        repo.trim(),
        ARTWORKS_PATH,
        toBase64(`${JSON.stringify(next, null, 2)}\n`),
        "Œuvre supprimée",
        jsonSha ?? undefined
      );
      setJsonSha(newSha ?? jsonSha);
      setArtworks(next);
      setStatus("Œuvre supprimée ✓");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suppression impossible.");
    } finally {
      setBusy(false);
    }
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <div className="card-glass rounded-2xl p-8">
          <h1 className="flex items-center gap-3 text-2xl font-bold">
            <BrushIcon className="h-7 w-7 text-[var(--magenta)]" />
            Atelier — accès privé
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Espace de gestion des œuvres de David Drioton.
          </p>
          <form className="mt-6 space-y-3" onSubmit={login}>
            <input
              type="password"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              placeholder="Secret"
              className={inputCls}
              autoFocus
            />
            {authError ? <p className="text-sm text-red-400">{authError}</p> : null}
            <button type="submit" className="btn-accent w-full rounded-lg py-2.5 font-bold">
              Entrer
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="flex items-center gap-3 text-3xl font-black">
        <BrushIcon className="h-8 w-8 text-[var(--amber)]" />
        <span className="accent-amber">Atelier</span> — gestion des œuvres
      </h1>
      <p className="mt-2 text-white/60">
        Les œuvres sont enregistrées directement dans le dépôt GitHub : après
        chaque ajout, le site se met à jour tout seul.
      </p>

      {/* Connexion GitHub */}
      <div className="card-glass mt-8 space-y-4 rounded-2xl p-6">
        <h2 className="text-lg font-bold">1 · Connexion à GitHub</h2>
        <p className="text-xs text-white/50">
          Jeton personnel à créer une fois sur{" "}
            <a
              href="https://github.com/settings/personal-access-tokens/new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--amber)] hover:underline"
            >
              GitHub → Settings → Tokens
            </a>{" "}
            (Fine-grained, accès « Contents: Read and write » sur le dépôt).
            Il n&apos;est enregistré que dans votre navigateur, jamais publié.
        </p>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Jeton GitHub"
            className={inputCls}
          />
          <input
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder={`Dépôt (ex. ${DEFAULT_REPO})`}
            className={inputCls}
          />
        </div>
        <button
          onClick={connect}
          disabled={busy || !token.trim()}
          className="btn-accent rounded-lg px-5 py-2.5 font-semibold disabled:opacity-50"
        >
          {connected ? "Reconnecter" : "Connecter à GitHub"}
        </button>
      </div>

      {connected ? (
        <>
          {/* Liste des œuvres */}
          <div className="card-glass mt-6 rounded-2xl p-6">
            <h2 className="text-lg font-bold">Œuvres en ligne ({artworks.length})</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {artworks.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.image} alt={a.title} className="h-16 w-12 shrink-0 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{a.title}</p>
                    <p className="truncate text-xs text-white/50">
                      {a.widthCm && a.heightCm ? `${a.widthCm}×${a.heightCm} cm` : ""}{" "}
                      {a.year ?? ""}
                    </p>
                  </div>
                  <button
                    onClick={() => removeArtwork(a.id)}
                    className="rounded-md px-2 py-1 text-xs text-red-400 transition hover:bg-red-500/10"
                  >
                    Suppr.
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Ajout d'une œuvre */}
          <form onSubmit={addArtwork} className="card-glass mt-6 space-y-4 rounded-2xl p-6">
            <h2 className="text-lg font-bold">Ajouter une œuvre</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-white/50">Titre *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} placeholder="Ex. Taureau pop art" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">Technique</label>
                <input value={technique} onChange={(e) => setTechnique(e.target.value)} className={inputCls} placeholder="Acrylique sur toile" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">Image (fichier)</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">… ou URL d'image</label>
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className={inputCls} placeholder="https://…" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">Année</label>
                <input value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" className={inputCls} placeholder="2026" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-white/50">Largeur (cm)</label>
                  <input value={widthCm} onChange={(e) => setWidthCm(e.target.value)} inputMode="numeric" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Hauteur (cm)</label>
                  <input value={heightCm} onChange={(e) => setHeightCm(e.target.value)} inputMode="numeric" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Prix (€)</label>
                  <input value={priceEur} onChange={(e) => setPriceEur(e.target.value)} inputMode="numeric" className={inputCls} />
                </div>
              </div>
            </div>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            {status ? (
              <p className="flex items-center gap-2 text-sm text-emerald-400">
                <CanvasCheckIcon className="h-4 w-4" /> {status}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={busy}
              className="btn-accent rounded-lg px-6 py-2.5 font-bold disabled:opacity-50"
            >
              {busy ? "Ajout en cours…" : "Ajouter l'œuvre"}
            </button>
          </form>
        </>
      ) : null}
    </div>
  );
}