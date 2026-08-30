"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  MIN_CM,
  formatDimensions,
  formatEur,
  quoteCommission,
} from "@/lib/pricing";
import type { Artwork } from "@/lib/types";
import { CanvasCheckIcon } from "@/components/icons";
import { site } from "@/lib/site";

function OrderFormInner({ artworks }: { artworks: Artwork[] }) {
  const params = useSearchParams();
  const initialRef = params.get("ref") ?? "";

  const [referenceId, setReferenceId] = useState(initialRef);
  const [title, setTitle] = useState("");
  const [widthCm, setWidthCm] = useState(60);
  const [heightCm, setHeightCm] = useState(80);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const quote = useMemo(() => quoteCommission(widthCm, heightCm), [widthCm, heightCm]);
  const reference = artworks.find((a) => a.id === referenceId);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Site 100 % statique (GitHub Pages) : la commande est envoyée par
    // email à l'atelier, avec tout le récapitulatif pré-rempli.
    const subject = `Commande sur mesure — ${reference?.title ?? (title || "Création libre")}`;
    const body = [
      "Bonjour David,",
      "",
      "Je souhaite commander une pièce sur mesure :",
      `- Référence : ${reference?.title ?? "Création libre"}`,
      `- Idée / sujet : ${title}`,
      `- Dimensions : ${formatDimensions(quote.widthCm, quote.heightCm)} (${quote.areaCm2.toLocaleString("fr-FR")} cm²)`,
      `- Prix estimé : ${formatEur(quote.priceEur)}`,
      "",
      `Nom : ${name}`,
      `Email : ${email}`,
      ...(message ? [`Message : ${message}`] : []),
    ].join("\n");

    const mailto = `mailto:${site.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    // Ouvre le client mail dans une fenêtre séparée, SANS quitter ni
    // rediriger la page de commande actuelle.
    const link = document.createElement("a");
    link.href = mailto;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="card-glass rounded-2xl p-8 text-center">
        <CanvasCheckIcon className="mx-auto h-14 w-14 text-[var(--teal)]" />
        <h2 className="mt-3 text-2xl font-bold">Commande prête à envoyer !</h2>
        <p className="mt-2 text-white/70">
          {formatDimensions(quote.widthCm, quote.heightCm)} ·{" "}
          <span className="accent-amber font-semibold">{formatEur(quote.priceEur)}</span>
        </p>
        <p className="mt-3 text-sm text-white/60">
          Votre messagerie s'est ouverte avec le récapitulatif pré-rempli.
          Envoyez-le à l'atelier — David vous répondra pour confirmer la pièce
          et le paiement. Sinon, contactez-le directement sur{" "}
          <a
            href={site.social[0].href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--amber)] hover:underline"
          >
            Instagram
          </a>
          .
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href={`mailto:${site.email}`}
            className="btn-accent rounded-lg px-5 py-2.5 font-semibold"
          >
            Écrire à l'atelier
          </a>
          <a
            href={site.social[0].href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/20 px-5 py-2.5 font-semibold text-white/85 transition hover:border-[var(--amber)] hover:text-[var(--amber)]"
          >
            Instagram
          </a>
        </div>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-white/15 bg-[var(--ink-soft)] px-3 py-2.5 text-sm outline-none focus:border-[var(--magenta)]";

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="card-glass space-y-5 rounded-2xl p-6">
        <div>
          <label className="mb-1.5 block text-sm font-semibold">Style de référence</label>
          <select
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            className={inputCls}
          >
            <option value="">— Aucune référence, création libre —</option>
            {artworks.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
          {reference ? (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={reference.image}
                alt={reference.title}
                className="h-24 w-16 rounded-lg object-cover"
              />
              <div className="text-sm text-white/70">
                <p className="font-semibold text-white">{reference.title}</p>
                <p className="text-xs">{reference.technique}</p>
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold">Idée / sujet de la pièce</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ex. « Taureau pop art pour le salon »"
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            Taille de l'œuvre — au centimètre carré
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-white/50">
                Largeur (cm) · min. {MIN_CM}
              </label>
              <input
                type="number"
                min={MIN_CM}
                max={300}
                step={1}
                value={widthCm}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setWidthCm(Number.isFinite(v) ? Math.max(0, v) : 0);
                }}
                onBlur={() => setWidthCm((s) => Math.max(MIN_CM, Math.floor(s) || MIN_CM))}
                className={inputCls}
              />
            </div>
            <span className="pt-4 text-white/40">×</span>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-white/50">
                Hauteur (cm) · min. {MIN_CM}
              </label>
              <input
                type="number"
                min={MIN_CM}
                max={300}
                step={1}
                value={heightCm}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setHeightCm(Number.isFinite(v) ? Math.max(0, v) : 0);
                }}
                onBlur={() => setHeightCm((s) => Math.max(MIN_CM, Math.floor(s) || MIN_CM))}
                className={inputCls}
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-white/50">
            Minimum réalisable :{" "}
            <span className="font-semibold text-white/85">
              {MIN_CM} × {MIN_CM} cm
            </span>{" "}
            — une toile plus petite n'existe pas à l'atelier. Surface :{" "}
            <span className="text-white/85">{quote.areaCm2.toLocaleString("fr-FR")} cm²</span>.
          </p>
          <p className="mt-1.5 text-xs text-white/50">
            Tarif établi selon la cote i-CAC de l'artiste — repère :{" "}
            <span className="text-white/85">{quote.refLabel}</span> ≈{" "}
            <span className="font-semibold text-white/85">{formatEur(quote.refPriceEur)}</span>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Votre nom</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            Message à l'artiste (optionnel)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className={inputCls}
          />
        </div>
      </div>

      <aside className="card-glass h-fit rounded-2xl p-6 lg:sticky lg:top-20">
        <h2 className="text-lg font-bold">Récapitulatif</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-white/60">Surface</dt>
            <dd>{quote.areaCm2.toLocaleString("fr-FR")} cm²</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/60">Dimensions</dt>
            <dd>{formatDimensions(quote.widthCm, quote.heightCm)}</dd>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold">
            <dt>Total</dt>
            <dd className="accent-amber">{formatEur(quote.priceEur)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-white/40">
          Envoyez le récapitulatif par email : David vous confirmera la pièce,
          le délai et le moyen de paiement (virement, chèque ou retrait à
          l'atelier de Barjols).
        </p>
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        <button type="submit" className="btn-accent mt-5 w-full rounded-lg py-3 font-bold">
          Valider ma commande
        </button>
      </aside>
    </form>
  );
}

export function OrderForm({ artworks }: { artworks: Artwork[] }) {
  return (
    <Suspense fallback={<p className="text-white/50">Chargement…</p>}>
      <OrderFormInner artworks={artworks} />
    </Suspense>
  );
}
