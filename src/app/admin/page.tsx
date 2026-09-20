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

/** Chemin du site déployé sur GitHub Pages (sous-dossier) ou raciné en local. */
const DEPLOY_BASE = "/DavidDiotron_WebSite";

/** Préfixe les chemins d'images du dépôt quand on est déployé sous un sous-dossier. */
function publicImage(p: string): string {
  if (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith(DEPLOY_BASE + "/") &&
    p.startsWith("/")
  ) {
    return DEPLOY_BASE + p;
  }
  return p;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");

  const [token, setToken] = useState("");
  const [hasSavedToken, setHasSavedToken] = useState(false);
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
  const [price, setPrice] = useState("");
  /** id de l'œuvre dont on édite le prix + valeur courante du champ. */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");

  const inputCls =
    "w-full rounded-lg border border-white/15 bg-[var(--ink-soft)] px-3 py-2 text-sm outline-none focus:border-[var(--amber)]";

  useEffect(() => {
    if (sessionStorage.getItem(PASSWORD_KEY) === "1") setAuthed(true);
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      setToken(saved);
      setHasSavedToken(true);
    }
  }, []);

  useEffect(() => {
    // Connecte automatiquement si un jeton est déjà enregistré — le champ
    // jeton ne réapparaît jamais ensuite.
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
      // Le jeton enregistré ne fonctionne plus : on réaffiche le champ jeton.
      setHasSavedToken(false);
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

  /** Écrit la liste d'œuvres dans le dépôt (commit automatique). */
  async function writeArtworks(next: Artwork[], message: string): Promise<boolean> {
    const newSha = await putFile(
      token.trim(),
      DEFAULT_REPO,
      ARTWORKS_PATH,
      toBase64(`${JSON.stringify(next, null, 2)}\n`),
      message,
      jsonSha ?? undefined
    );
    setJsonSha(newSha ?? jsonSha);
    setArtworks(next);
    return true;
  }

  async function remove(id: string) {
    const target = artworks.find((a) => a.id === id);
    if (!target || !window.confirm(`Supprimer « ${target.title} » ?`)) return;
    setError("");
    setStatus("");
    setBusy(true);
    try {
      await writeArtworks(
        artworks.filter((a) => a.id !== id),
        `Œuvre supprimée : ${target.title}`
      );
      setStatus(`« ${target.title} » supprimée — le site se met à jour automatiquement (≈ 2 min).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suppression impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function savePrice(id: string) {
    const target = artworks.find((a) => a.id === id);
    if (!target) return;
    setError("");
    setStatus("");
    const raw = editPrice.trim();
    const value = raw === "" ? null : Number(raw.replace(",", "."));
    if (raw !== "" && (!Number.isFinite(value) || (value as number) < 0)) {
      setError("Prix invalide : entrez un nombre (ex. 950) ou laissez vide.");
      return;
    }
    setBusy(true);
    try {
      const next = artworks.map((a) => {
        if (a.id !== id) return a;
        const updated = { ...a };
        if (value === null) {
          delete updated.priceEur;
          delete updated.priceOnRequest;
        } else {
          updated.priceEur = value as number;
          delete updated.priceOnRequest;
        }
        return updated;
      });
      await writeArtworks(
        next,
        `Tarif fixé : ${target.title}${value ? ` — ${value} €` : " — sur devis"}`
      );
      setEditingId(null);
      setStatus(
        `Tarif de « ${target.title} » ${value ? `fixé à ${value} €` : "mis sur devis"} — le site se met à jour (≈ 2 min).`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
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
      const rawPrice = price.trim();
      if (rawPrice !== "") {
        const value = Number(rawPrice.replace(",", "."));
        if (!Number.isFinite(value) || value < 0)
          throw new Error("Prix invalide : entrez un nombre (ex. 950) ou laissez vide.");
        artwork.priceEur = value;
      }
      const next = [...artworks, artwork];
      await writeArtworks(next, `Œuvre ajoutée : ${artwork.title}`);
      setTitle(""); setImageUrl(""); setImageFile(null); setPrice("");
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

      {/* Suite à une connexion réussie, le jeton est masqué : on ne montre
          l'écran « jeton » qu'à la toute première fois. */}
      {!connected && hasSavedToken && (
        <p className="mt-6 text-sm text-white/50">Connexion au dépôt…</p>
      )}

      {/* Première connexion : jeton GitHub (une seule fois) */}
      {!connected && !hasSavedToken && (
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
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputMode="decimal"
                placeholder="Prix fixe en € (optionnel — vide = sur devis)"
                className={`${inputCls} sm:max-w-xs`}
              />
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
                <div key={a.id} className="rounded-xl bg-white/5 p-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={publicImage(a.image)}
                      alt={a.title}
                      loading="lazy"
                      className="h-14 w-10 shrink-0 rounded object-cover bg-white/10"
                      onError={(e) => {
                        const img = e.currentTarget;
                        // Si le chemin préfixé échoue, retente sans préfixe
                        // (et inversement) une seule fois.
                        const alt = img.src.includes(DEPLOY_BASE)
                          ? img.src.replace(DEPLOY_BASE, "")
                          : DEPLOY_BASE + img.getAttribute("src");
                        if (!img.dataset.retried) {
                          img.dataset.retried = "1";
                          img.src = alt;
                        }
                      }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-white">{a.title}</span>
                    <button
                      type="button"
                      onClick={() => remove(a.id)}
                      disabled={busy}
                      title="Supprimer cette œuvre"
                      className="shrink-0 rounded-md border border-white/15 px-2 py-1 text-xs text-white/50 transition hover:border-red-400 hover:text-red-400 disabled:opacity-40"
                    >
                      Suppr.
                    </button>
                  </div>
                  {/* Tarif fixe : affichage + édition inline */}
                  <div className="mt-2 flex items-center justify-between gap-2 pl-[3.25rem]">
                    {editingId === a.id ? (
                      <div className="flex w-full items-center gap-1.5">
                        <input
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          inputMode="decimal"
                          placeholder="ex. 950 (vide = sur devis)"
                          className="w-full rounded-md border border-white/15 bg-[var(--ink-soft)] px-2 py-1 text-xs outline-none focus:border-[var(--amber)]"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              void savePrice(a.id);
                            }
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => void savePrice(a.id)}
                          disabled={busy}
                          className="btn-accent shrink-0 rounded-md px-2.5 py-1 text-xs font-bold disabled:opacity-40"
                        >
                          OK
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="shrink-0 rounded-md border border-white/15 px-2 py-1 text-xs text-white/50"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs text-white/60">
                          {a.priceEur && !a.priceOnRequest ? (
                            <>
                              <span className="font-bold text-[var(--amber)]">
                                {a.priceEur.toLocaleString("fr-FR")} €
                              </span>{" "}
                              <span className="text-white/35">prix fixe</span>
                            </>
                          ) : (
                            <span className="text-white/35">sur devis</span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(a.id);
                            setEditPrice(
                              a.priceEur && !a.priceOnRequest ? String(a.priceEur) : ""
                            );
                          }}
                          className="rounded-md border border-white/15 px-2 py-1 text-xs text-white/60 transition hover:border-[var(--amber)] hover:text-[var(--amber)]"
                        >
                          Fixer le prix
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
