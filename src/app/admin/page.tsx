"use client";

import { useEffect, useState } from "react";
import type { Artwork } from "@/lib/types";
import { DEFAULT_REPO, getFileText, putFile, toBase64 } from "@/lib/github";
import { BrushIcon, CanvasCheckIcon } from "@/components/icons";

// Mot de passe d'accès à l'atelier (visible côté client : verrou léger,
// la vraie protection des écritures reste le jeton GitHub).
const ADMIN_PASSWORD = "atelier-2026";
const PASSWORD_KEY = "drioton-admin-ok";
const TOKEN_KEY = "drioton-github-token";

const ARTWORKS_PATH = "data/artworks.json";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");

  const [token, setToken] = useState("");
  const [connected, setConnected] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [jsonSha, setJsonSha] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsToken, setNeedsToken] = useState(false);

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const inputCls =
    "w-full rounded-lg border border-white/15 bg-[var(--ink-soft)] px-3 py-2 text-sm outline-none focus:border-[var(--amber)]";

  useEffect(() => {
    if (sessionStorage.getItem(PASSWORD_KEY) === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (authed && !token) {
      const saved = localStorage.getItem(TOKEN_KEY);
      if (saved) setToken(saved);
    }
  }, [authed, token]);

  useEffect(() => {
    // Connecte automatiquement si un jeton est déjà enregistré.
    if (authed && token && !connected) {
      void connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, token]);

  async function connect() {
    setStatus("");
    setError("");
    setBusy(true);
    try {
      const file = await getFileText(token.trim(), DEFAULT_REPO, ARTWORKS_PATH);
      if (!file) throw new Error("Le fichier des œuvres est introuvable dans le dépôt.");
      setArtworks(JSON.parse(file.text) as Artwork[]);
      setJsonSha(file.sha);
      setConnected(true);
      setNeedsToken(false);
      localStorage.setItem(TOKEN_KEY, token.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connexion impossible.");
      setNeedsToken(true);
    } finally {
      setBusy(false);
    }
  }

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem(PASSWORD_KEY, "1");
    } else {
      setPwError("Mot de passe incorrect.");
    }
  }

  function readFileBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve((r.result as string).split(",")[1] ?? "");
      r.onerror = () => reject(new Error("Lecture de l'image impossible."));
      r.readAsDataURL(file);
    });
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setStatus(""); setBusy(true);
    try {
      if (!token.trim()) throw new Error("Connectez-vous d'abord à GitHub (jeton).");
      if (!title.trim()) throw new Error("Il faut un titre.");
      if (!imageFile && !imageUrl.trim())
        throw new Error("Ajoutez une image (fichier) ou une URL d'image.");

      const id = `art-${Date.now().toString(36)}`;
      let image: string;

      if (imageFile) {
        const ext = (imageFile.name.split(".").pop() || "jpg").toLowerCase();
        const b64 = await readFileBase64(imageFile);
        await putFile(
          token.trim(),
          DEFAULT_REPO,
          `public/artworks/${id}.${ext}`,
          b64,
          `Nouvelle œuvre ${id}`
        );
        image = `/artworks/${id}.${ext}`;
      } else {
        image = imageUrl.trim();
      }

      const artwork: Artwork = { id, title: title.trim(), image };
      const next = [...artworks, artwork];
      const newSha = await putFile(
        token.trim(),
        DEFAULT_REPO,
        ARTWORKS_PATH,
        toBase64(`${JSON.stringify(next, null, 2)}\n`),
        `Œuvre ajoutée : ${artwork.title}`,
        jsonSha ?? undefined
      );
      setJsonSha(newSha ?? jsonSha);
      setArtworks(next);
      setTitle(""); setImageUrl(""); setImageFile(null);
      setStatus(`« ${artwork.title} » ajoutée ✓ — le site se met à jour automatiquement (≈ 2 min).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ajout impossible.");
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
            Atelier
          </h1>
          <form className="mt-6 space-y-3" onSubmit={login}>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Mot de passe"
              className={inputCls}
              autoFocus
            />
            {pwError ? <p className="text-sm text-red-400">{pwError}</p> : null}
            <button type="submit" className="btn-accent w-full rounded-lg py-2.5 font-bold">
              Entrer
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="flex items-center gap-3 text-3xl font-black">
        <BrushIcon className="h-8 w-8 text-[var(--amber)]" />
        <span className="accent-amber">Atelier</span>
      </h1>
      <p className="mt-2 text-sm text-white/60">
        {artworks.length} œuvre(s) en ligne. Les ajouts se mettent en ligne tout seuls.
      </p>

      {/* Première connexion : jeton GitHub (une seule fois) */}
      {!connected && (
        <div className="card-glass mt-6 rounded-2xl p-6">
          <h2 className="text-base font-bold">Connexion à GitHub (une fois)</h2>
          <p className="mt-1 text-xs text-white/50">
            Collez un jeton GitHub (fine-grained, permission « Contents: Read and write » sur le
            dépôt). Il est enregistré dans votre navigateur et ne sera plus demandé ensuite.
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Jeton GitHub"
              className={inputCls}
            />
            <button
              onClick={connect}
              disabled={busy || !token.trim()}
              className="btn-accent shrink-0 rounded-lg px-5 py-2 font-semibold disabled:opacity-50"
            >
              {busy ? "Connexion…" : "Connecter"}
            </button>
          </div>
          {needsToken ? (
            <p className="mt-2 text-xs text-white/40">
              Créer un jeton : GitHub → Settings → Developer settings → Personal access tokens →
              Fine-grained tokens → accès « Contents: Read and write » sur le dépôt.
            </p>
          ) : null}
          {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
        </div>
      )}

      {connected ? (
        <>
          <div className="card-glass mt-6 rounded-2xl p-6">
            <h2 className="text-base font-bold">Ajouter une œuvre</h2>
            <form onSubmit={add} className="mt-3 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Titre de l'œuvre *"
                  className={inputCls}
                />
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-xs text-white/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                      className="text-xs"
                    />
                    <span>ou</span>
                  </label>
                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="… ou URL d'image (ex. Instagram)"
                    className={inputCls}
                  />
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
          </div>

          <div className="mt-6">
            <h2 className="text-base font-bold text-white/70">Œuvres en ligne</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {artworks.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.image} alt={a.title} className="h-14 w-10 shrink-0 rounded object-cover" />
                  <span className="min-w-0 flex-1 truncate text-sm text-white">{a.title}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}