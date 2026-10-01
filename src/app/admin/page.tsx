"use client";

import { useEffect, useState } from "react";
import type { Artwork } from "@/lib/types";
import { DEFAULT_REPO, getFileText, putFile, toBase64 } from "@/lib/github";
import {
  SessionExpired,
  logout,
  publishPc,
  readArtworksPc,
  saveArtworksPc,
  savedSession,
} from "@/lib/atelier-api";
import { AtelierLogin } from "@/components/atelier/AtelierLogin";
import { CanvasCheckIcon } from "@/components/icons";

const TOKEN_KEY = "drioton-github-token";
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

/** Connexion active : la base de l'ordinateur (session) ou le dépôt GitHub (clé). */
type Link = { mode: "pc"; session: string } | { mode: "github"; token: string; sha: string | null };

function readFileBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve((r.result as string).split(",")[1] ?? "");
    r.onerror = () => reject(new Error("Lecture de l'image impossible."));
    r.readAsDataURL(file);
  });
}

export default function AdminPage() {
  const [link, setLink] = useState<Link | null>(null);
  const [ready, setReady] = useState(false);
  const [savedToken, setSavedToken] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");

  /* ------------------------------------------------------------- */
  /* Ouverture : reprend une session encore valide                  */
  /* ------------------------------------------------------------- */

  useEffect(() => {
    try {
      setSavedToken(localStorage.getItem(TOKEN_KEY));
    } catch {
      /* stockage indisponible */
    }
    const session = savedSession();
    if (!session) {
      setReady(true);
      return;
    }
    readArtworksPc(session)
      .then((list) => {
        setArtworks(list);
        setLink({ mode: "pc", session });
      })
      .catch(() => {
        /* session expirée ou base arrêtée : écran de connexion */
      })
      .finally(() => setReady(true));
  }, []);

  async function enterPc(session: string) {
    setArtworks(await readArtworksPc(session));
    setLink({ mode: "pc", session });
    setStatus("");
    setError("");
  }

  async function enterGithub(token: string) {
    if (!token) throw new Error("Collez votre clé GitHub.");
    const file = await getFileText(token, DEFAULT_REPO, "data/artworks.json").catch((e) => {
      throw new Error(
        /Bad credentials/i.test(String(e?.message))
          ? "Clé GitHub refusée : elle est incorrecte ou a expiré."
          : `GitHub : ${e?.message ?? "connexion impossible"}`
      );
    });
    if (!file) throw new Error("Le fichier des œuvres est introuvable dans le dépôt.");
    setArtworks(JSON.parse(file.text) as Artwork[]);
    setLink({ mode: "github", token, sha: file.sha });
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* clé gardée le temps de la page */
    }
    setSavedToken(token);
  }

  async function signOut() {
    if (link?.mode === "pc") await logout(link.session);
    setLink(null);
    setArtworks([]);
    setNotice("Vous êtes déconnecté.");
  }

  function forgetGithubKey() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* rien à oublier */
    }
    setSavedToken(null);
    setLink(null);
    setArtworks([]);
    setNotice("La clé GitHub a été oubliée sur cet appareil.");
  }

  /* ------------------------------------------------------------- */
  /* Enregistrement : base de l'ordinateur ou dépôt GitHub          */
  /* ------------------------------------------------------------- */

  /** Enregistre la liste complète, avec les nouvelles images éventuelles. */
  async function commit(next: Artwork[], message: string, newImages: Record<string, string> = {}) {
    if (!link) return;
    if (link.mode === "pc") {
      await saveArtworksPc(link.session, next, newImages);
      setArtworks(next);
      return;
    }
    for (const [name, b64] of Object.entries(newImages)) {
      await putFile(link.token, DEFAULT_REPO, `public/artworks/${name}`, b64, `Nouvelle œuvre ${name}`);
    }
    await putFile(
      link.token,
      DEFAULT_REPO,
      "data/artworks.json",
      toBase64(`${JSON.stringify(next, null, 2)}\n`),
      message,
      link.sha ?? undefined
    );
    const fresh = await getFileText(link.token, DEFAULT_REPO, "data/artworks.json");
    if (fresh) {
      setArtworks(JSON.parse(fresh.text) as Artwork[]);
      setLink({ ...link, sha: fresh.sha });
    }
  }

  /** Exécute une action ; une session expirée ramène à l'écran de connexion. */
  async function run(action: () => Promise<string | void>) {
    setError("");
    setStatus("");
    setBusy(true);
    try {
      const done = await action();
      if (done) setStatus(done);
    } catch (e) {
      if (e instanceof SessionExpired) {
        setLink(null);
        setNotice(e.message);
      } else {
        setError(e instanceof Error ? e.message : "Opération impossible.");
      }
    } finally {
      setBusy(false);
    }
  }

  const live = link?.mode === "github" ? "site en ligne à jour dans 2 minutes environ" : "sur cet ordinateur";

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      if (!title.trim()) throw new Error("Il faut un titre.");
      if (!imageFile && !imageUrl.trim()) throw new Error("Ajoutez une photo ou l'adresse d'une image.");

      const id = `art-${Date.now().toString(36)}`;
      const newImages: Record<string, string> = {};
      let image: string;
      if (imageFile) {
        const ext = (imageFile.name.split(".").pop() || "jpg").toLowerCase();
        newImages[`${id}.${ext}`] = await readFileBase64(imageFile);
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

      await commit([...artworks, artwork], `Œuvre ajoutée : ${artwork.title}`, newImages);
      setTitle("");
      setImageUrl("");
      setImageFile(null);
      setPrice("");
      (e.target as HTMLFormElement).reset();
      return `« ${artwork.title} » ajoutée, ${live}.`;
    });
  };

  const remove = (id: string) => {
    const target = artworks.find((a) => a.id === id);
    if (!target || !window.confirm(`Supprimer « ${target.title} » de la galerie ?`)) return;
    void run(async () => {
      await commit(
        artworks.filter((a) => a.id !== id),
        `Œuvre supprimée : ${target.title}`
      );
      return `« ${target.title} » supprimée, ${live}.`;
    });
  };

  const savePrice = (id: string) => {
    const target = artworks.find((a) => a.id === id);
    if (!target) return;
    const raw = editPrice.trim();
    const value = raw === "" ? null : Number(raw.replace(",", "."));
    if (raw !== "" && (!Number.isFinite(value) || (value as number) < 0)) {
      setError("Prix invalide : entrez un nombre (ex. 950) ou laissez vide.");
      return;
    }
    void run(async () => {
      const next = artworks.map((a) => {
        if (a.id !== id) return a;
        const updated = { ...a };
        delete updated.priceOnRequest;
        if (value === null) delete updated.priceEur;
        else updated.priceEur = value;
        return updated;
      });
      await commit(next, `Tarif fixé : ${target.title}${value ? ` — ${value} €` : " — sur devis"}`);
      setEditingId(null);
      return `Prix de « ${target.title} » : ${value ? `${value.toLocaleString("fr-FR")} €` : "sur devis"}.`;
    });
  };

  const toggleSold = (id: string) => {
    const target = artworks.find((a) => a.id === id);
    if (!target) return;
    const nowSold = !target.sold;
    void run(async () => {
      const next = artworks.map((a) => {
        if (a.id !== id) return a;
        const updated = { ...a };
        if (nowSold) updated.sold = true;
        else delete updated.sold;
        return updated;
      });
      await commit(next, `${nowSold ? "Vendue" : "De nouveau disponible"} : ${target.title}`);
      return `« ${target.title} » ${nowSold ? "marquée vendue" : "de nouveau disponible"}.`;
    });
  };

  const publish = () =>
    run(async () => {
      if (link?.mode !== "pc") return;
      await publishPc(link.session);
      return "Galerie publiée : le site en ligne se met à jour dans 2 minutes environ.";
    });

  /* ------------------------------------------------------------- */
  /* Écrans                                                         */
  /* ------------------------------------------------------------- */

  if (!ready) {
    return (
      <section className="bloc bloc-noir min-h-[60svh] py-20">
        <p className="wrap soft">Ouverture de l'atelier…</p>
      </section>
    );
  }

  if (!link) {
    return (
      <AtelierLogin
        key={notice}
        notice={notice}
        savedGithubToken={savedToken}
        onSession={enterPc}
        onGithub={enterGithub}
      />
    );
  }

  return (
    <>
      <section className="bloc bloc-noir halftone pb-[clamp(2.5rem,6vw,4rem)] pt-[clamp(2rem,5vw,3.5rem)]">
        <div className="wrap relative flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div>
            <h1 className="poster t-lg">L'atelier</h1>
            <p className="soft small mt-3 flex items-center gap-2">
              <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full bg-[#25d366]" />
              {link.mode === "pc"
                ? "Connecté à la base de cet ordinateur. Les changements restent ici jusqu'à « Publier »."
                : "Connecté au dépôt GitHub. Chaque changement est mis en ligne directement."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            {link.mode === "pc" ? (
              <button type="button" onClick={() => void publish()} disabled={busy} className="btn">
                {busy ? "Patientez…" : "Publier sur le site"}
              </button>
            ) : (
              <button type="button" onClick={forgetGithubKey} className="link small">
                Oublier la clé sur cet appareil
              </button>
            )}
            <button type="button" onClick={() => void signOut()} className="btn btn-ghost btn-sm">
              Se déconnecter
            </button>
          </div>
        </div>
      </section>

      <section className="bloc bloc-papier pb-[clamp(4rem,10vw,7rem)] pt-[clamp(2.5rem,6vw,4rem)]">
        <div className="wrap">
          <div aria-live="polite" className="min-h-[1.5rem]">
            {error ? (
              <p role="alert" className="border-l-4 border-[var(--magenta)] pl-3 font-semibold">
                {error}
              </p>
            ) : status ? (
              <p className="flex items-center gap-2 border-l-4 border-[#1a9c4a] pl-3 font-semibold">
                <CanvasCheckIcon className="h-5 w-5" /> {status}
              </p>
            ) : null}
          </div>

          {/* Ajouter une œuvre */}
          <form onSubmit={add} className="mt-6 border-t-2 border-[var(--fg)] pt-6">
            <h2 className="poster t-md">Ajouter une toile</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <label className="field-label">
                Titre
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="NEON CANDY N°2"
                  className="field mt-2 font-normal"
                />
              </label>
              <label className="field-label">
                Prix fixe en € <span className="faint font-normal">(vide = sur devis)</span>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  inputMode="decimal"
                  placeholder="950"
                  className="field mt-2 font-normal"
                />
              </label>
              <label className="field-label">
                Photo de la toile
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="field mt-2 py-2.5 font-normal file:mr-3 file:border-0 file:bg-[var(--noir)] file:px-3 file:py-1.5 file:font-bold file:text-[var(--papier)]"
                />
              </label>
              <label className="field-label">
                Ou adresse d'une image <span className="faint font-normal">(Instagram…)</span>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  inputMode="url"
                  placeholder="https://…"
                  className="field mt-2 font-normal"
                />
              </label>
            </div>
            <button type="submit" disabled={busy} className="btn mt-6">
              {busy ? "Enregistrement…" : "Ajouter la toile"}
            </button>
          </form>

          {/* Les œuvres */}
          <h2 className="poster t-md mt-[clamp(3rem,7vw,5rem)] border-t-2 border-[var(--fg)] pt-6">
            Les toiles ({artworks.length})
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-2">
            {artworks.map((a) => (
              <li key={a.id} className="flex gap-4 border-b border-[var(--line)] py-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={publicImage(a.image)}
                  alt=""
                  loading="lazy"
                  className="h-20 w-14 shrink-0 bg-[var(--line)] object-cover"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.dataset.retried) return;
                    img.dataset.retried = "1";
                    img.src = img.src.includes(DEPLOY_BASE)
                      ? img.src.replace(DEPLOY_BASE, "")
                      : DEPLOY_BASE + img.getAttribute("src");
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{a.title}</p>
                  {editingId === a.id ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <input
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        inputMode="decimal"
                        placeholder="950 (vide = sur devis)"
                        aria-label={`Prix de ${a.title} en euros`}
                        className="field min-h-[2.75rem] w-44 py-1.5"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            savePrice(a.id);
                          }
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <button type="button" onClick={() => savePrice(a.id)} disabled={busy} className="btn btn-sm">
                        Enregistrer
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="link small">
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="small mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                      {a.sold ? (
                        <span className="dot-sold">Vendue</span>
                      ) : (
                        <span className="soft">
                          {a.priceEur && !a.priceOnRequest
                            ? `${a.priceEur.toLocaleString("fr-FR")} €`
                            : "Sur devis"}
                        </span>
                      )}
                      <button
                        type="button"
                        className="link"
                        onClick={() => {
                          setEditingId(a.id);
                          setEditPrice(a.priceEur && !a.priceOnRequest ? String(a.priceEur) : "");
                        }}
                      >
                        Prix
                      </button>
                      <button type="button" className="link" disabled={busy} onClick={() => toggleSold(a.id)}>
                        {a.sold ? "Remettre en vente" : "Marquer vendue"}
                      </button>
                      <button type="button" className="link" disabled={busy} onClick={() => remove(a.id)}>
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
