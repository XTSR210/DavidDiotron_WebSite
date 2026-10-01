"use client";

import { useEffect, useId, useRef, useState } from "react";

/** Côté le plus long de la grande version : nette en plein écran. */
const MAX_SIDE = 1600;
/** Largeur de la version moyenne : murs de l'accueil, galerie, vignettes. */
const MEDIUM_WIDTH = 600;
const QUALITY = 0.86;

export interface PreparedImage {
  /** Grande version, JPEG en base64 (sans préfixe data:). */
  base64: string;
  /** Version moyenne (600 px de large), JPEG en base64. */
  medium: string;
  /** Aperçu local (URL objet) pour l'affichage immédiat. */
  preview: string;
  width: number;
  height: number;
  /** Poids final en octets. */
  bytes: number;
}

/**
 * Prépare une photo de toile dans le navigateur : orientation corrigée,
 * réduite à 1600 px de côté au plus, convertie en JPEG, avec une version
 * moyenne de 600 px. Une photo de téléphone de 5 Mo devient environ 300 Ko.
 */
async function encode(bitmap: ImageBitmap, width: number, height: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Préparation de l'image impossible.");
  ctx.fillStyle = "#fff"; // fond blanc sous les PNG transparents
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Conversion impossible."))), "image/jpeg", QUALITY)
  );
}

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(new Error("Lecture de l'image impossible."));
    r.readAsDataURL(blob);
  });
}

async function prepare(file: File): Promise<PreparedImage> {
  if (!file.type.startsWith("image/")) throw new Error("Ce fichier n'est pas une image.");
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => {
    throw new Error("Image illisible. Essayez une photo JPEG ou PNG.");
  });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const mScale = Math.min(1, MEDIUM_WIDTH / bitmap.width);
  const [blob, mediumBlob] = await Promise.all([
    encode(bitmap, width, height),
    encode(bitmap, Math.round(bitmap.width * mScale), Math.round(bitmap.height * mScale)),
  ]);
  bitmap.close();
  const [base64, medium] = await Promise.all([toBase64(blob), toBase64(mediumBlob)]);
  return { base64, medium, preview: URL.createObjectURL(blob), width, height, bytes: blob.size };
}

/**
 * Zone photo : glisser-déposer, clic pour parcourir (ou appareil photo sur
 * téléphone), aperçu immédiat. `current` est l'image déjà enregistrée.
 */
export function ImageDrop({
  current,
  value,
  onChange,
  onError,
}: {
  current?: string;
  value: PreparedImage | null;
  onChange: (img: PreparedImage | null) => void;
  onError: (message: string) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [working, setWorking] = useState(false);

  // Libère l'aperçu quand il est remplacé.
  useEffect(() => () => (value ? URL.revokeObjectURL(value.preview) : undefined), [value]);

  async function take(file: File | undefined) {
    if (!file) return;
    setWorking(true);
    try {
      onChange(await prepare(file));
    } catch (e) {
      onError(e instanceof Error ? e.message : "Image refusée.");
    } finally {
      setWorking(false);
      if (input.current) input.current.value = "";
    }
  }

  const shown = value?.preview ?? current;

  return (
    <div>
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void take(e.dataTransfer.files?.[0]);
        }}
        className={`relative flex min-h-[15rem] cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-4 text-center transition-colors ${
          over ? "border-[var(--fg)] bg-[var(--jaune)]/40" : "border-[var(--line)] hover:border-[var(--fg)]"
        }`}
      >
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" className="max-h-72 w-auto max-w-full object-contain shadow-[6px_6px_0_var(--noir)]" />
        ) : (
          <>
            <span className="poster t-sm">Déposez la photo ici</span>
            <span className="soft small">ou cliquez pour la choisir (appareil photo sur téléphone)</span>
          </>
        )}
        {working ? (
          <span className="absolute inset-0 grid place-items-center bg-[var(--papier)]/80 font-bold">
            Préparation de la photo…
          </span>
        ) : null}
      </label>
      <input
        ref={input}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => void take(e.target.files?.[0])}
      />
      <div className="small soft mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <span>
          {value
            ? `Nouvelle photo : ${value.width} × ${value.height} px, ${Math.round(value.bytes / 1024)} Ko`
            : shown
              ? "Photo actuelle"
              : "JPEG ou PNG. Réduite automatiquement à 1600 px."}
        </span>
        {shown ? (
          <span className="flex gap-4">
            <button type="button" className="link" onClick={() => input.current?.click()}>
              {current || value ? "Remplacer" : "Choisir"}
            </button>
            {value ? (
              <button type="button" className="link" onClick={() => onChange(null)}>
                Annuler
              </button>
            ) : null}
          </span>
        ) : null}
      </div>
    </div>
  );
}
