"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Artwork } from "@/lib/types";
import { ImageDrop, type PreparedImage } from "@/components/atelier/ImageDrop";

/** Fiche en cours d'édition : tout est texte, converti à l'enregistrement. */
interface Draft {
  title: string;
  technique: string;
  widthCm: string;
  heightCm: string;
  year: string;
  priced: boolean;
  priceEur: string;
  sold: boolean;
  note: string;
  imageUrl: string;
}

function toDraft(a?: Artwork): Draft {
  const priced = Boolean(a?.priceEur && !a.priceOnRequest);
  return {
    title: a?.title ?? "",
    technique: a?.technique ?? "",
    widthCm: a?.widthCm ? String(a.widthCm) : "",
    heightCm: a?.heightCm ? String(a.heightCm) : "",
    year: a?.year ? String(a.year) : "",
    priced,
    priceEur: priced ? String(a!.priceEur) : "",
    sold: Boolean(a?.sold),
    note: a?.note ?? "",
    imageUrl: a && !a.image.startsWith("/") ? a.image : "",
  };
}

/** Nombre positif saisi à la française (« 1 250,50 »), ou undefined si vide. */
function number(raw: string, label: string, { integer = false, min = 0, max = Infinity } = {}) {
  const t = raw.replace(/\s/g, "").replace(",", ".");
  if (!t) return undefined;
  const n = Number(t);
  if (!Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n))) {
    throw new Error(`${label} : valeur invalide.`);
  }
  return n;
}

/** Construit l'œuvre enregistrée à partir de la fiche (les champs vides disparaissent). */
function build(base: Artwork | undefined, d: Draft, image: string): Artwork {
  if (!d.title.trim()) throw new Error("Il faut un titre.");
  const out: Artwork = { ...(base ?? { id: `art-${Date.now().toString(36)}` }), title: d.title.trim(), image };
  for (const k of ["technique", "widthCm", "heightCm", "year", "priceEur", "priceOnRequest", "sold", "note"] as const) {
    delete out[k];
  }
  // Nouvelle image : son format et ses versions réduites seront recalculés.
  if (base && base.image !== image) {
    delete out.ratio;
    delete out.thumb;
    delete out.medium;
  }
  if (d.technique.trim()) out.technique = d.technique.trim();
  const w = number(d.widthCm, "Largeur", { integer: true, min: 1, max: 1000 });
  const h = number(d.heightCm, "Hauteur", { integer: true, min: 1, max: 1000 });
  if ((w === undefined) !== (h === undefined)) throw new Error("Indiquez la largeur et la hauteur, ou aucune des deux.");
  if (w && h) {
    out.widthCm = w;
    out.heightCm = h;
  }
  const year = number(d.year, "Année", { integer: true, min: 1950, max: new Date().getFullYear() });
  if (year) out.year = year;
  if (d.priced) {
    const price = number(d.priceEur, "Prix", { min: 1 });
    if (!price) throw new Error("Indiquez le prix, ou choisissez « Sur devis ».");
    out.priceEur = price;
  }
  if (d.sold) out.sold = true;
  if (d.note.trim()) out.note = d.note.trim();
  return out;
}

/**
 * Fiche d'une toile : création ou modification. Rien n'est enregistré avant
 * « Enregistrer » ; « Annuler » rend la fiche telle qu'elle était.
 */
export function ArtworkEditor({
  artwork,
  techniques,
  busy,
  onSave,
  onDelete,
  onClose,
  onDirtyChange,
  onError,
}: {
  /** Absent : nouvelle toile. */
  artwork?: Artwork;
  techniques: string[];
  busy: boolean;
  onSave: (artwork: Artwork, image: PreparedImage | null) => Promise<void>;
  onDelete: (artwork: Artwork) => void;
  onClose: () => void;
  onDirtyChange: (dirty: boolean) => void;
  onError: (message: string) => void;
}) {
  const initial = useMemo(() => toDraft(artwork), [artwork]);
  const [d, setD] = useState<Draft>(initial);
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [showUrl, setShowUrl] = useState(Boolean(initial.imageUrl));
  const priceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setD(initial);
    setImage(null);
    setShowUrl(Boolean(initial.imageUrl));
  }, [initial]);

  const dirty = image !== null || JSON.stringify(d) !== JSON.stringify(initial);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const isNew = !artwork;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const url = d.imageUrl.trim();
      const currentImage = artwork?.image ?? "";
      const imagePath = image ? "" : url || currentImage;
      if (!image && !imagePath) throw new Error("Ajoutez la photo de la toile.");
      if (!image && url && !/^https?:\/\//i.test(url)) throw new Error("L'adresse de l'image doit commencer par https://");
      await onSave(build(artwork, d, imagePath), image);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Enregistrement impossible.");
    }
  }

  const label = "field-label";
  const cm = (k: "widthCm" | "heightCm", text: string) => (
    <label className={label}>
      {text} <span className="faint font-normal">(cm)</span>
      <input
        value={d[k]}
        onChange={(e) => set(k, e.target.value)}
        inputMode="numeric"
        placeholder="—"
        className="field mt-2 font-normal tabular-nums"
      />
    </label>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="poster t-md">{isNew ? "Nouvelle toile" : d.title || "Sans titre"}</h2>
          <p className="soft small mt-1">
            {isNew ? "Elle s'ajoutera à la fin de la galerie." : dirty ? "Modifications non enregistrées" : "Fiche à jour"}
          </p>
        </div>
        <button type="button" onClick={onClose} className="link small shrink-0">
          Fermer
        </button>
      </div>

      <ImageDrop
        current={artwork?.image && !image ? artwork.image : undefined}
        value={image}
        onChange={setImage}
        onError={onError}
      />
      {showUrl ? (
        <label className={label}>
          Adresse d'une image en ligne <span className="faint font-normal">(à la place d'une photo)</span>
          <input
            value={d.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
            inputMode="url"
            placeholder="https://…"
            className="field mt-2 font-normal"
          />
        </label>
      ) : (
        <button type="button" className="link small self-start" onClick={() => setShowUrl(true)}>
          Utiliser plutôt l'adresse d'une image en ligne
        </button>
      )}

      <label className={label}>
        Titre
        <input
          value={d.title}
          onChange={(e) => set("title", e.target.value)}
          required
          placeholder="NEON CANDY N°2"
          className="field mt-2 font-normal"
          autoFocus={isNew}
        />
      </label>

      <label className={label}>
        Technique
        <input
          value={d.technique}
          onChange={(e) => set("technique", e.target.value)}
          list="techniques"
          placeholder="Technique mixte sur toile"
          className="field mt-2 font-normal"
        />
        <datalist id="techniques">
          {techniques.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </label>

      <div className="grid grid-cols-3 gap-3">
        {cm("widthCm", "Largeur")}
        {cm("heightCm", "Hauteur")}
        <label className={label}>
          Année
          <input
            value={d.year}
            onChange={(e) => set("year", e.target.value)}
            inputMode="numeric"
            placeholder="—"
            className="field mt-2 font-normal tabular-nums"
          />
        </label>
      </div>

      <fieldset className="min-w-0">
        <legend className={label}>Prix</legend>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="chip" aria-pressed={!d.priced} onClick={() => set("priced", false)}>
            Sur devis
          </button>
          <button
            type="button"
            className="chip"
            aria-pressed={d.priced}
            onClick={() => {
              set("priced", true);
              // Le champ du prix apparaît : on y place le curseur.
              setTimeout(() => priceRef.current?.focus(), 0);
            }}
          >
            Prix fixe
          </button>
          {d.priced ? (
            <span className="flex items-center gap-2">
              <input
                value={d.priceEur}
                onChange={(e) => set("priceEur", e.target.value)}
                inputMode="decimal"
                placeholder="950"
                aria-label="Prix en euros"
                className="field w-32 font-bold tabular-nums"
                ref={priceRef}
              />
              <span className="font-bold">€</span>
            </span>
          ) : null}
        </div>
      </fieldset>

      <fieldset className="min-w-0">
        <legend className={label}>Statut</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="chip" aria-pressed={!d.sold} onClick={() => set("sold", false)}>
            Disponible
          </button>
          <button type="button" className="chip" aria-pressed={d.sold} onClick={() => set("sold", true)}>
            Vendue
          </button>
        </div>
        <p className="faint small mt-2">
          Une toile vendue reste dans la galerie avec une pastille rouge ; les visiteurs peuvent en
          commander une dans le même esprit.
        </p>
      </fieldset>

      <label className={label}>
        Note <span className="faint font-normal">(facultatif, visible en grand format)</span>
        <textarea
          value={d.note}
          onChange={(e) => set("note", e.target.value)}
          rows={3}
          placeholder="Fragments d'affiches déchirées, icônes de la pop…"
          className="field mt-2 font-normal"
        />
      </label>

      <div className="sticky bottom-0 -mx-1 flex flex-wrap items-center gap-x-5 gap-y-3 border-t-2 border-[var(--fg)] bg-[var(--bg)] px-1 py-4">
        <button type="submit" className="btn" disabled={busy || (!dirty && !isNew)}>
          {busy ? "Enregistrement…" : isNew ? "Ajouter à la galerie" : "Enregistrer"}
        </button>
        {dirty && !isNew ? (
          <button
            type="button"
            className="link small"
            onClick={() => {
              setD(initial);
              setImage(null);
            }}
          >
            Annuler les modifications
          </button>
        ) : null}
        {!isNew ? (
          <button
            type="button"
            className="link small ml-auto"
            disabled={busy}
            onClick={() => onDelete(artwork)}
          >
            Supprimer la toile
          </button>
        ) : null}
      </div>
    </form>
  );
}
