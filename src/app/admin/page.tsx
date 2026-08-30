"use client";

import { useCallback, useEffect, useState } from "react";
import type { Artwork } from "@/lib/types";
import { BrushIcon } from "@/components/icons";

const SECRET_KEY = "drioton-admin-secret";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    image: "",
    technique: "",
    year: "",
    widthCm: "",
    heightCm: "",
    priceEur: "",
    note: "",
    source: "Instagram @daviddrioton",
  });

  useEffect(() => {
    const saved = window.sessionStorage.getItem(SECRET_KEY);
    if (saved) {
      setSecret(saved);
      setAuthed(true);
    }
  }, []);

  const load = useCallback(
    async (sec: string) => {
      setBusy(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/artworks?secret=${encodeURIComponent(sec)}`);
        if (res.status === 401) throw new Error("Secret invalide.");
        const body = (await res.json()) as { artworks: Artwork[] };
        setArtworks(body.artworks);
        setAuthed(true);
        window.sessionStorage.setItem(SECRET_KEY, sec);
      } catch (err) {
        setAuthed(false);
        setError(err instanceof Error ? err.message : "Erreur.");
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (authed && secret) void load(secret);
  }, [authed, secret, load]);

  const resetForm = () =>
    setForm({
      title: "",
      image: "",
      technique: "",
      year: "",
      widthCm: "",
      heightCm: "",
      priceEur: "",
      note: "",
      source: "Instagram @daviddrioton",
    });

  function startEdit(a: Artwork) {
    setEditingId(a.id);
    setError("");
    setForm({
      title: a.title,
      image: a.image,
      technique: a.technique ?? "",
      year: a.year ? String(a.year) : "",
      widthCm: a.widthCm ? String(a.widthCm) : "",
      heightCm: a.heightCm ? String(a.heightCm) : "",
      priceEur: a.priceEur ? String(a.priceEur) : "",
      note: a.note ?? "",
      source: a.source ?? "Instagram @daviddrioton",
    });
    document.getElementById("artwork-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function cancelEdit() {
    setEditingId(null);
    resetForm();
    setError("");
  }

  async function saveArtwork(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/artworks", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, secret, id: editingId ?? undefined }),
      });
      const body = (await res.json()) as { error?: string; artwork?: Artwork };
      if (!res.ok) throw new Error(body.error ?? "Échec de l'enregistrement.");
      if (body.artwork) {
        const saved = body.artwork as Artwork;
        setArtworks((prev) =>
          editingId ? prev.map((a) => (a.id === editingId ? saved : a)) : [saved, ...prev],
        );
      }
      setEditingId(null);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/artworks?id=${encodeURIComponent(id)}&secret=${encodeURIComponent(secret)}`, {
        method: "DELETE",
      });
      if (res.ok) setArtworks((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-white/15 bg-[var(--ink-soft)] px-3 py-2 text-sm outline-none focus:border-[var(--amber)]";

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <div className="card-glass rounded-2xl p-8">
          <h1 className="flex items-center gap-3 text-2xl font-bold">
            <BrushIcon className="h-7 w-7 text-[var(--magenta)]" />
            Atelier — accès privé
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Espace de gestion des œuvres. Entrez le secret de l'atelier.
          </p>
          <form
            className="mt-6 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void load(secret);
            }}
          >
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Secret"
              className={inputCls}
              autoFocus
            />
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <button type="submit" disabled={busy} className="btn-accent w-full rounded-lg py-2.5 font-bold">
              Entrer
            </button>
          </form>
          <p className="mt-4 text-xs text-white/35">
            Secret par défaut localhost : <code>atelier-2026</code> (modifiable via
            <code> DRIOTON_ADMIN_SECRET</code>).
          </p>
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
        {artworks.length} œuvres en ligne. Les ajouts et modifications
        apparaissent immédiatement dans la galerie et sur l'accueil.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[380px_1fr]">
        <form
          id="artwork-form"
          onSubmit={saveArtwork}
          className="card-glass h-fit space-y-3 rounded-2xl p-5"
        >
          <h2 className="font-bold">
            {editingId ? (
              <>
                Modifier <span className="accent-amber">l'œuvre</span>
              </>
            ) : (
              "Ajouter une œuvre"
            )}
          </h2>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Titre *"
            className={inputCls}
          />
          <input
            required
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="URL image * (https://… ou /uploads/…)"
            className={inputCls}
          />
          <input
            value={form.technique}
            onChange={(e) => setForm({ ...form, technique: e.target.value })}
            placeholder="Technique"
            className={inputCls}
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              placeholder="Année"
              className={inputCls}
            />
            <input
              value={form.widthCm}
              onChange={(e) => setForm({ ...form, widthCm: e.target.value })}
              placeholder="L. cm"
              className={inputCls}
            />
            <input
              value={form.heightCm}
              onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
              placeholder="H. cm"
              className={inputCls}
            />
          </div>
          <input
            value={form.priceEur}
            onChange={(e) => setForm({ ...form, priceEur: e.target.value })}
            placeholder="Prix € (vide = sur demande)"
            className={inputCls}
          />
          <input
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Note"
            className={inputCls}
          />
          <input
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            placeholder="Source"
            className={inputCls}
          />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-accent flex-1 rounded-lg py-2.5 font-bold">
              {busy ? "…" : editingId ? "Enregistrer" : "Ajouter à la galerie"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={cancelEdit}
                disabled={busy}
                className="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:border-white/40 hover:text-white"
              >
                Annuler
              </button>
            ) : null}
          </div>
        </form>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {artworks.map((a) => (
            <div key={a.id} className="card-glass overflow-hidden rounded-xl">
              <div className="relative aspect-[3/4]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image} alt={a.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-2.5">
                <p className="truncate text-sm font-semibold">{a.title}</p>
                <div className="mt-1 flex gap-3 text-xs">
                  <button
                    onClick={() => startEdit(a)}
                    disabled={busy}
                    className="font-semibold accent-amber transition hover:brightness-110"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => void remove(a.id)}
                    disabled={busy}
                    className="text-red-400 transition hover:text-red-300"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
