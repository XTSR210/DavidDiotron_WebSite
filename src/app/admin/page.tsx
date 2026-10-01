"use client";

import { useEffect, useMemo, useState } from "react";
import type { Artwork } from "@/lib/types";
import { SessionExpired, changePassword, logout, readGallery, saveGallery, uploadPhoto } from "@/lib/atelier-api";
import { AtelierLogin, Message, PasswordField, RecoveryKey } from "@/components/atelier/AtelierLogin";
import { ArtworkEditor } from "@/components/atelier/ArtworkEditor";
import type { PreparedImage } from "@/components/atelier/ImageDrop";

type Filter = "all" | "sale" | "quote" | "sold";
const isPriced = (a: Artwork) => Boolean(a.priceEur && !a.priceOnRequest);
const FILTERS: { key: Filter; label: string; test: (a: Artwork) => boolean }[] = [
  { key: "all", label: "Toutes", test: () => true },
  { key: "sale", label: "Prix fixe", test: (a) => !a.sold && isPriced(a) },
  { key: "quote", label: "Sur devis", test: (a) => !a.sold && !isPriced(a) },
  { key: "sold", label: "Vendues", test: (a) => Boolean(a.sold) },
];

const euros = (n: number) => `${n.toLocaleString("fr-FR")} €`;

/** Vrai sur grand écran : la fiche s'affiche alors en colonne, sinon en plein écran. */
function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return wide;
}

export default function AdminPage() {
  const wide = useWide();
  const [signedIn, setSignedIn] = useState(false);
  const [notice, setNotice] = useState("");
  const [settings, setSettings] = useState(false);

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  // Le message disparaît seul après quelques secondes.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.error ? 9000 : 5000);
    return () => clearTimeout(t);
  }, [toast]);

  // Fiche modifiée non enregistrée : on prévient avant de quitter la page.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function enter() {
    setArtworks(await readGallery());
    setSignedIn(true);
  }

  async function signOut() {
    if (dirty && !window.confirm("La fiche ouverte n'est pas enregistrée. Se déconnecter quand même ?")) return;
    await logout();
    setSignedIn(false);
    setArtworks([]);
    setSelected(null);
    setDirty(false);
    setNotice("Vous êtes déconnecté.");
  }

  /* ------------------------------------------------------------- */
  /* Enregistrement : en ligne, visible aussitôt sur le site        */
  /* ------------------------------------------------------------- */

  async function commit(next: Artwork[]) {
    setArtworks(await saveGallery(next));
  }

  /** Exécute une action ; une session expirée ramène à l'écran de connexion. */
  async function run(action: () => Promise<string | void>) {
    setBusy(true);
    try {
      const done = await action();
      if (done) setToast({ text: done });
    } catch (e) {
      if (e instanceof SessionExpired) {
        setSignedIn(false);
        setNotice(e.message);
      } else {
        setToast({ text: e instanceof Error ? e.message : "Opération impossible.", error: true });
      }
    } finally {
      setBusy(false);
    }
  }


  async function save(edited: Artwork, image: PreparedImage | null) {
    await run(async () => {
      let next = edited;
      if (image) {
        const sent = await uploadPhoto(edited.id, image.base64, image.medium);
        next = { ...edited, image: sent.image, medium: sent.medium, thumb: sent.medium, ratio: image.width / image.height };
      }
      const exists = artworks.some((a) => a.id === next.id);
      const list = exists ? artworks.map((a) => (a.id === next.id ? next : a)) : [...artworks, next];
      await commit(list);
      setDirty(false);
      setSelected(next.id);
      return `« ${next.title} » ${exists ? "enregistrée" : "ajoutée à la galerie"}. C'est en ligne.`;
    });
  }

  function remove(target: Artwork) {
    if (!window.confirm(`Supprimer « ${target.title} » de la galerie ?`)) return;
    void run(async () => {
      await commit(artworks.filter((a) => a.id !== target.id));
      setDirty(false);
      setSelected(null);
      return `« ${target.title} » supprimée du site.`;
    });
  }

  function move(id: string, by: -1 | 1) {
    const i = artworks.findIndex((a) => a.id === id);
    const j = i + by;
    if (i < 0 || j < 0 || j >= artworks.length) return;
    const next = [...artworks];
    [next[i], next[j]] = [next[j], next[i]];
    void run(async () => {
      await commit(next);
    });
  }

  function open(next: string | null) {
    if (next === selected) return;
    if (dirty && !window.confirm("La fiche ouverte n'est pas enregistrée. Abandonner les modifications ?")) return;
    setDirty(false);
    setSelected(next);
  }

  /* ------------------------------------------------------------- */
  /* Données affichées                                              */
  /* ------------------------------------------------------------- */

  const stats = useMemo(() => {
    const sold = artworks.filter((a) => a.sold).length;
    const priced = artworks.filter((a) => !a.sold && isPriced(a));
    return {
      total: artworks.length,
      available: artworks.length - sold,
      sold,
      priced: priced.length,
      value: priced.reduce((s, a) => s + (a.priceEur ?? 0), 0),
    };
  }, [artworks]);

  const techniques = useMemo(
    () => [...new Set(artworks.map((a) => a.technique).filter(Boolean) as string[])].sort(),
    [artworks]
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const test = FILTERS.find((f) => f.key === filter)!.test;
    return artworks.filter((a) => test(a) && (!q || `${a.title} ${a.technique ?? ""}`.toLowerCase().includes(q)));
  }, [artworks, query, filter]);

  const current = selected && selected !== "new" ? artworks.find((a) => a.id === selected) : undefined;
  const canReorder = filter === "all" && !query.trim();

  /* ------------------------------------------------------------- */
  /* Écrans                                                         */
  /* ------------------------------------------------------------- */

  if (!signedIn) {
    return <AtelierLogin key={notice} notice={notice} onSignedIn={enter} />;
  }

  const editor =
    selected !== null ? (
      <ArtworkEditor
        key={selected}
        artwork={current}
        techniques={techniques}
        busy={busy}
        onSave={save}
        onDelete={remove}
        onClose={() => open(null)}
        onDirtyChange={setDirty}
        onError={(text) => setToast({ text, error: true })}
      />
    ) : null;

  return (
    <>
      {/* Tableau de bord */}
      <section className="bloc bloc-noir halftone pb-8 pt-[clamp(2rem,5vw,3rem)]">
        <div className="wrap relative">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
            <div>
              <h1 className="poster t-lg">L'atelier</h1>
              <p className="soft small mt-3 flex items-center gap-2">
                <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full bg-[#25d366]" />
                En ligne. Chaque enregistrement apparaît aussitôt sur le site.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <button type="button" onClick={() => setSettings(true)} className="link small">
                Changer le mot de passe
              </button>
              <button type="button" onClick={() => void signOut()} className="btn btn-ghost btn-sm">
                Se déconnecter
              </button>
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-t-2 border-[var(--fg)] pt-6 sm:grid-cols-4">
            {[
              { k: String(stats.total), v: "toiles dans la galerie" },
              { k: String(stats.available), v: stats.available > 1 ? "disponibles" : "disponible" },
              { k: String(stats.sold), v: stats.sold > 1 ? "vendues" : "vendue" },
              {
                k: stats.priced ? euros(stats.value) : "—",
                v: `de prix affichés, sur ${stats.priced} toile${stats.priced > 1 ? "s" : ""}`,
              },
            ].map((s) => (
              <div key={s.v} className="flex flex-col-reverse">
                <dt className="soft small mt-1">{s.v}</dt>
                <dd className="poster t-md tabular-nums">{s.k}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Galerie + fiche */}
      <section className="bloc bloc-papier pb-24 pt-8">
        <div className="wrap grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une toile"
                aria-label="Rechercher une toile par titre ou technique"
                className="field min-w-0 flex-1 basis-56"
              />
              <button type="button" className="btn" onClick={() => open("new")}>
                Nouvelle toile
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtrer les toiles">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  className="chip"
                  aria-pressed={filter === f.key}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label} <span className="tabular-nums opacity-60">{artworks.filter(f.test).length}</span>
                </button>
              ))}
            </div>

            {shown.length === 0 ? (
              <p className="soft mt-10">
                {artworks.length === 0
                  ? "La galerie est vide : ajoutez la première toile."
                  : "Aucune toile ne correspond à cette recherche."}
              </p>
            ) : (
              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 xl:grid-cols-4">
                {shown.map((a) => {
                  const index = artworks.indexOf(a);
                  const active = selected === a.id;
                  return (
                    <li key={a.id} className="flex min-w-0 flex-col">
                      <button
                        type="button"
                        onClick={() => open(a.id)}
                        aria-pressed={active}
                        aria-label={`Modifier « ${a.title} »`}
                        className={`relative grid aspect-[4/5] place-items-center bg-[var(--noir)]/[0.06] p-3 transition-shadow ${
                          active ? "outline outline-3 outline-offset-2 outline-[var(--noir)]" : "hover:bg-[var(--noir)]/10"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={a.medium ?? a.image}
                          alt=""
                          loading="lazy"
                          className="max-h-full max-w-full object-contain shadow-[4px_4px_0_var(--noir)]"
                        />
                        {a.sold ? (
                          <span className="dot-sold absolute left-2 top-2 bg-[var(--papier)] px-2 py-0.5 text-xs">
                            Vendue
                          </span>
                        ) : null}
                      </button>
                      <p className="mt-2 truncate font-bold leading-tight">{a.title}</p>
                      <div className="soft small flex items-center justify-between gap-2">
                        <span className="truncate">
                          {a.sold ? "Vendue" : isPriced(a) ? euros(a.priceEur!) : "Sur devis"}
                        </span>
                        {canReorder ? (
                          <span className="flex shrink-0">
                            <button
                              type="button"
                              className="grid h-9 w-9 place-items-center text-lg hover:bg-[var(--line)] disabled:opacity-25"
                              disabled={busy || index === 0}
                              onClick={() => move(a.id, -1)}
                              aria-label={`Avancer « ${a.title} » dans la galerie`}
                              title="Avancer dans la galerie"
                            >
                              ‹
                            </button>
                            <button
                              type="button"
                              className="grid h-9 w-9 place-items-center text-lg hover:bg-[var(--line)] disabled:opacity-25"
                              disabled={busy || index === artworks.length - 1}
                              onClick={() => move(a.id, 1)}
                              aria-label={`Reculer « ${a.title} » dans la galerie`}
                              title="Reculer dans la galerie"
                            >
                              ›
                            </button>
                          </span>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {canReorder && shown.length > 1 ? (
              <p className="faint small mt-6">
                L'ordre ici est celui de la galerie du site. Les flèches avancent ou reculent une toile.
              </p>
            ) : null}
          </div>

          {/* Fiche : colonne collante sur grand écran, plein écran sur téléphone */}
          <aside className="hidden lg:sticky lg:top-6 lg:block lg:max-h-[calc(100svh-3rem)] lg:overflow-y-auto lg:pr-1">
            {wide && editor ? editor : (
              <div className="border-2 border-dashed border-[var(--line)] p-8 text-center">
                <p className="poster t-sm">Choisissez une toile</p>
                <p className="soft small mt-2">
                  pour modifier son prix, son statut ou sa fiche, ou ajoutez-en une nouvelle.
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>

      {editor && !wide ? (
        <div
          className="bloc bloc-papier fixed inset-0 z-[90] overflow-y-auto px-[var(--gutter)] pt-6"
          role="dialog"
          aria-modal="true"
          aria-label="Fiche de la toile"
        >
          {editor}
        </div>
      ) : null}

      {settings ? <PasswordDialog onClose={() => setSettings(false)} onExpired={() => setSignedIn(false)} /> : null}

      {toast ? (
        <div
          role={toast.error ? "alert" : "status"}
          className={`fixed bottom-5 left-1/2 z-[100] w-[min(92vw,34rem)] -translate-x-1/2 border-2 lg:left-[var(--gutter)] lg:translate-x-0 border-[var(--noir)] px-5 py-4 font-semibold shadow-[6px_6px_0_var(--noir)] ${
            toast.error ? "bg-[var(--magenta)] text-white" : "bg-[var(--jaune)] text-[var(--noir)]"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <span>{toast.text}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Fermer le message"
              className="shrink-0 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Changement de mot de passe (connecté) : donne aussi une nouvelle clé de secours. */
function PasswordDialog({ onClose, onExpired }: { onClose: () => void; onExpired: () => void }) {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !key && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [key, onClose]);

  return (
    <div
      className="fixed inset-0 z-[110] grid place-items-center overflow-y-auto bg-[var(--noir)]/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Changer le mot de passe"
    >
      <div className="bloc bloc-noir panel w-full max-w-md">
        <h2 className="poster t-md">{key ? "Nouvelle clé de secours" : "Changer le mot de passe"}</h2>
        <div className="mt-6">
          {key ? (
            <RecoveryKey value={key} onDone={onClose} />
          ) : (
            <form
              className="space-y-5"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                if (password.length < 8) return setError("Au moins 8 caractères.");
                if (password !== confirm) return setError("Les deux mots de passe sont différents.");
                setBusy(true);
                try {
                  setKey(await changePassword(current, password));
                } catch (err) {
                  if (err instanceof SessionExpired) onExpired();
                  setError(err instanceof Error ? err.message : "Changement impossible.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <PasswordField label="Mot de passe actuel" value={current} onChange={setCurrent} autoComplete="current-password" autoFocus />
              <PasswordField label="Nouveau mot de passe" value={password} onChange={setPassword} autoComplete="new-password" />
              <PasswordField label="Confirmez-le" value={confirm} onChange={setConfirm} autoComplete="new-password" />
              <Message error={error} />
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <button type="submit" className="btn" disabled={busy}>
                  {busy ? "Enregistrement…" : "Changer"}
                </button>
                <button type="button" className="link small" onClick={onClose}>
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
