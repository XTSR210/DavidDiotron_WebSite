"use client";

import { useEffect, useState } from "react";
import type { Artwork } from "@/lib/types";
import { DEFAULT_REPO, getFileText, putFile, toBase64 } from "@/lib/github";
import { BrushIcon, CanvasCheckIcon } from "@/components/icons";

// Mot de passe d'accès à l'atelier (identique côté serveur local).
const ADMIN_PASSWORD = "atelier-2026";
const PASSWORD_KEY = "drioton-admin-ok";
const TOKEN_KEY = "drioton-github-token";

/** Serveur local (base de données du PC), interrogé uniquement en local. */
const LOCAL_SERVER = "http://localhost:3311";
/** Chemin du site déployé sur GitHub Pages (sous-dossier) ou raciné en local. */
const DEPLOY_BASE = "/DavidDiotron_WebSite";

/** Préfixe les chemins d'images quand on est déployé sous un sous-dossier. */
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

type Mode = "pc" | "github";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");

  // Mode PC (serveur local)
  const [pcState, setPcState] = useState<"checking" | "on" | "off">("checking");
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [publishMsg, setPublishMsg] = useState("");

  // Mode GitHub (secours quand le PC n'est pas joignable)
  const [mode, setMode] = useState<Mode>("pc");
  const [token, setToken] = useState("");
  const [hasSavedToken, setHasSavedToken] = useState(false);
  const [connected, setConnected] = useState(false);
  const [jsonSha, setJsonSha] = useState<string | null>(null);
  const [needsToken, setNeedsToken] = useState(false);

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [price, setPrice] = useState("");
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

  // Détection du serveur local dès l'ouverture de la page.
  useEffect(() => {
    let cancelled = false;
    fetch(`${LOCAL_SERVER}/health`, { mode: "cors" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (!cancelled && d?.ok) setPcState("on");
      })
      .catch(() => {
        if (!cancelled) setPcState("off");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------------------------- */
  /* Chargement des œuvres selon le mode                            */
  /* ------------------------------------------------------------- */

  async function loadLocal(password: string) {
    const r = await fetch(`${LOCAL_SERVER}/api/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pw: password }),
    });
    const d = await r.json();
    if (!r.ok || !d.ok) throw new Error(d.error || "Lecture impossible sur le PC.");
    setArtworks(d.artworks as Artwork[]);
    setMode("pc");
    setConnected(false);
    setStatus("");
    setError("");
  }

  async function connectGithub() {
    setStatus("");
    setError("");
    setBusy(true);
    try {
      const file = await getFileText(token.trim(), DEFAULT_REPO, "data/artworks.json");
      if (!file) throw new Error("Le fichier des œuvres est introuvable dans le dépôt.");
      setArtworks(JSON.parse(file.text) as Artwork[]);
      setJsonSha(file.sha);
      setMode("github");
      setConnected(true);
      setNeedsToken(false);
      localStorage.setItem(TOKEN_KEY, token.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connexion impossible.");
      setNeedsToken(true);
      setHasSavedToken(false);
    } finally {
      setBusy(false);
    }
  }

  /* ------------------------------------------------------------- */
  /* Écriture locale (PC) : images + JSON en une requête            */
  /* ------------------------------------------------------------- */

  async function saveLocal(next: Artwork[], newImages: Record<string, string> = {}) {
    const r = await fetch(`${LOCAL_SERVER}/api/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pw: pw || ADMIN_PASSWORD,
        artworks: next,
        images: newImages,
      }),
    });
    const d = await r.json();
    if (!r.ok || !d.ok) throw new Error(d.error || "Enregistrement impossible sur le PC.");
    setArtworks(next);
  }

  function readFileBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve((r.result as string).split(",")[1] ?? "");
      r.onerror = () => reject(new Error("Lecture de l'image impossible."));
      r.readAsDataURL(file);
    });
  }

  /* ------------------------------------------------------------- */
  /* Actions : ajout, suppression, prix, statut, publication        */
  /* ------------------------------------------------------------- */

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("");
    setBusy(true);
    try {
      if (!title.trim()) throw new Error("Il faut un titre.");
      if (!imageFile && !imageUrl.trim())
        throw new Error("Ajoutez une image (fichier) ou une URL d'image.");

      const id = `art-${Date.now().toString(36)}`;
      const newImages: Record<string, string> = {};
      let image: string;

      if (imageFile) {
        const ext = (imageFile.name.split(".").pop() || "jpg").toLowerCase();
        const b64 = await readFileBase64(imageFile);
        if (mode === "pc") {
          newImages[`${id}.${ext}`] = b64;
          image = `/artworks/${id}.${ext}`;
        } else {
          // Mode GitHub (secours) : envoi du fichier via l'API GitHub.
          await putFile(
            token.trim(),
            DEFAULT_REPO,
            `public/artworks/${id}.${ext}`,
            b64,
            `Nouvelle œuvre ${id}`
          );
          image = `/artworks/${id}.${ext}`;
        }
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
      if (mode === "pc") {
        await saveLocal(next, newImages);
        setStatus(`« ${artwork.title} » ajoutée sur votre PC ✓ (visible en local immédiatement)`);
      } else {
        await putFile(
          token.trim(),
          DEFAULT_REPO,
          "data/artworks.json",
          toBase64(`${JSON.stringify(next, null, 2)}\n`),
          `Œuvre ajoutée : ${artwork.title}`,
          jsonSha ?? undefined
        );
        const fresh = await getFileText(token.trim(), DEFAULT_REPO, "data/artworks.json");
        if (fresh) {
          setArtworks(JSON.parse(fresh.text) as Artwork[]);
          setJsonSha(fresh.sha);
        }
        setStatus(`« ${artwork.title} » ajoutée sur GitHub ✓ — site en ligne à jour (≈ 2 min)`);
      }
      setTitle("");
      setImageUrl("");
      setImageFile(null);
      setPrice("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ajout impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    const target = artworks.find((a) => a.id === id);
    if (!target || !window.confirm(`Supprimer « ${target.title} » ?`)) return;
    setError("");
    setStatus("");
    setBusy(true);
    try {
      const next = artworks.filter((a) => a.id !== id);
      if (mode === "pc") {
        await saveLocal(next);
        setStatus(`« ${target.title} » supprimée sur votre PC ✓`);
      } else {
        await putFile(
          token.trim(),
          DEFAULT_REPO,
          "data/artworks.json",
          toBase64(`${JSON.stringify(next, null, 2)}\n`),
          `Œuvre supprimée : ${target.title}`,
          jsonSha ?? undefined
        );
        const fresh = await getFileText(token.trim(), DEFAULT_REPO, "data/artworks.json");
        if (fresh) {
          setArtworks(JSON.parse(fresh.text) as Artwork[]);
          setJsonSha(fresh.sha);
        }
        setStatus(`« ${target.title} » supprimée sur GitHub ✓`);
      }
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
      if (mode === "pc") {
        await saveLocal(next);
      } else {
        await putFile(
          token.trim(),
          DEFAULT_REPO,
          "data/artworks.json",
          toBase64(`${JSON.stringify(next, null, 2)}\n`),
          `Tarif fixé : ${target.title}${value ? ` — ${value} €` : " — sur devis"}`,
          jsonSha ?? undefined
        );
        const fresh = await getFileText(token.trim(), DEFAULT_REPO, "data/artworks.json");
        if (fresh) {
          setArtworks(JSON.parse(fresh.text) as Artwork[]);
          setJsonSha(fresh.sha);
        }
      }
      setEditingId(null);
      setStatus(
        `Tarif de « ${target.title} » ${value ? `fixé à ${value} €` : "mis sur devis"} ✓`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleSold(id: string) {
    const target = artworks.find((a) => a.id === id);
    if (!target) return;
    setError("");
    setStatus("");
    setBusy(true);
    try {
      const next = artworks.map((a) => {
        if (a.id !== id) return a;
        const updated = { ...a };
        if (a.sold) {
          delete updated.sold;
        } else {
          updated.sold = true;
        }
        return updated;
      });
      const nowSold = !target.sold;
      if (mode === "pc") {
        await saveLocal(next);
      } else {
        await putFile(
          token.trim(),
          DEFAULT_REPO,
          "data/artworks.json",
          toBase64(`${JSON.stringify(next, null, 2)}\n`),
          `${nowSold ? "Vendue" : "De nouveau disponible"} : ${target.title}`,
          jsonSha ?? undefined
        );
        const fresh = await getFileText(token.trim(), DEFAULT_REPO, "data/artworks.json");
        if (fresh) {
          setArtworks(JSON.parse(fresh.text) as Artwork[]);
          setJsonSha(fresh.sha);
        }
      }
      setStatus(`« ${target.title} » ${nowSold ? "marquée vendue" : "remarquée disponible"} ✓`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }

  /** Publie la galerie du PC vers GitHub (commit + push via git local). */
  async function publish() {
    setPublishMsg("");
    setError("");
    setBusy(true);
    try {
      const r = await fetch(`${LOCAL_SERVER}/api/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pw: ADMIN_PASSWORD }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error(d.error || "Publication impossible.");
      setPublishMsg(`Publié ✓ — le site en ligne se met à jour dans ≈ 2 min.`);
    } catch (e) {
      setPublishMsg("");
      setError(e instanceof Error ? e.message : "Publication impossible.");
    } finally {
      setBusy(false);
    }
  }

  /* ------------------------------------------------------------- */
  /* Connexion après mot de passe : PC d'abord, sinon GitHub        */
  /* ------------------------------------------------------------- */

  useEffect(() => {
    if (!authed) return;
    if (pcState === "checking") return;
    if (pcState === "on" && artworks.length === 0 && !error) {
      void loadLocal(ADMIN_PASSWORD).catch(() => {
        /* l'UI affiche déjà l'état */
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, pcState]);

  /* ------------------------------------------------------------- */
  /* Écran de connexion                                             */
  /* ------------------------------------------------------------- */

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <div className="card-glass rounded-2xl p-8">
          <h1 className="flex items-center gap-3 text-2xl font-bold">
            <BrushIcon className="h-7 w-7 text-[var(--magenta)]" />
            Atelier
          </h1>
          <p className="mt-2 text-xs text-white/50">
            Base de données : votre PC (aucun jeton nécessaire en local).
          </p>
          <form
            className="mt-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (pw === ADMIN_PASSWORD) {
                setAuthed(true);
                sessionStorage.setItem(PASSWORD_KEY, "1");
              } else {
                setPwError("Mot de passe incorrect.");
              }
            }}
          >
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

  /* ------------------------------------------------------------- */
  /* Panneau                                                        */
  /* ------------------------------------------------------------- */

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="flex items-center gap-3 text-3xl font-black">
        <BrushIcon className="h-8 w-8 text-[var(--amber)]" />
        <span className="accent-amber">Atelier</span>
      </h1>

      {/* Bandeau mode : PC (base de données) ou GitHub (secours) */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        {pcState === "checking" ? (
          <span className="text-white/50">Recherche de la base locale…</span>
        ) : pcState === "on" ? (
          <span className="flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
            ● Base de données : ce PC (localhost:3311)
          </span>
        ) : (
          <span className="flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
            ● PC non joignable — mode GitHub (jeton requis)
          </span>
        )}
        {mode === "github" ? (
          <span className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/60">
            connecté au dépôt GitHub
          </span>
        ) : null}
      </div>

      {pcState === "off" && mode !== "github" ? (
        <div className="card-glass mt-5 rounded-2xl p-6">
          <h2 className="text-base font-bold">Mode GitHub (secours)</h2>
          <p className="mt-1 text-xs text-white/50">
            Le serveur local ne tourne pas sur ce PC. Démarrez-le avec{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5">atelier.bat</code> (double-clic à
            la racine du projet), ou connectez-vous au dépôt GitHub avec un jeton.
          </p>
          {!hasSavedToken ? (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Jeton GitHub (secours)"
                className={inputCls}
              />
              <button
                onClick={connectGithub}
                disabled={busy || !token.trim()}
                className="btn-accent shrink-0 rounded-lg px-5 py-2 font-semibold disabled:opacity-50"
              >
                {busy ? "Connexion…" : "Connecter"}
              </button>
            </div>
          ) : (
            <button
              onClick={connectGithub}
              disabled={busy}
              className="btn-accent mt-3 rounded-lg px-5 py-2 font-semibold disabled:opacity-50"
            >
              {busy ? "Connexion…" : "Connecter au dépôt (jeton enregistré)"}
            </button>
          )}
          {needsToken ? (
            <p className="mt-2 text-xs text-white/40">
              Jeton : GitHub → Settings → Developer settings → Fine-grained tokens →
              « Contents: Read and write ».
            </p>
          ) : null}
        </div>
        ) : null}

      {artworks.length > 0 || mode === "pc" || connected ? (
        <>
          {/* Publication (mode PC uniquement) */}
          {mode === "pc" ? (
            <div className="card-glass mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
              <p className="text-sm text-white/70">
                <span className="font-semibold text-white">Publier sur le site en ligne</span>{" "}
                — envoie la galerie de votre PC vers GitHub (le site se met à jour tout seul).
              </p>
              <button
                type="button"
                onClick={publish}
                disabled={busy}
                className="btn-accent rounded-lg px-6 py-2.5 font-bold disabled:opacity-50"
              >
                {busy ? "Publication…" : "Publier"}
              </button>
            </div>
          ) : null}

          {/* Ajouter une œuvre */}
          <div className="card-glass mt-5 rounded-2xl p-6">
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

          {/* Œuvres en ligne */}
          <div className="mt-6">
            <h2 className="text-base font-bold text-white/70">
              Œuvres ({artworks.length})
            </h2>
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
                  {/* Statut + tarif : édition inline */}
                  <div className="mt-2 flex items-center justify-between gap-2 pl-[3.25rem]">
                    <button
                      type="button"
                      onClick={() => void toggleSold(a.id)}
                      disabled={busy}
                      title="Basculer entre « vendue » et « disponible »"
                      className={`rounded-md border px-2 py-1 text-xs font-semibold transition disabled:opacity-40 ${
                        a.sold
                          ? "border-[var(--magenta)]/60 bg-[var(--magenta)]/10 text-[var(--magenta)]"
                          : "border-white/15 text-white/60 hover:border-[var(--teal)] hover:text-[var(--teal)]"
                      }`}
                    >
                      {a.sold ? "Vendue ✓" : "Disponible"}
                    </button>
                    {editingId === a.id ? (
                      <div className="flex min-w-0 flex-1 items-center gap-1.5">
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
