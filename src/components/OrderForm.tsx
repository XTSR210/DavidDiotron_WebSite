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
import { LeadTimeNote } from "@/components/commercial";
import { CanvasCheckIcon, MailIcon, WhatsAppIcon } from "@/components/icons";
import { site, waLink } from "@/lib/site";

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
  const [sentVia, setSentVia] = useState<"email" | "whatsapp" | null>(null);
  const [copied, setCopied] = useState(false);

  const quote = useMemo(() => quoteCommission(widthCm, heightCm), [widthCm, heightCm]);
  const reference = artworks.find((a) => a.id === referenceId);

  // Récapitulatif partagé : email (mailto), WhatsApp (wa.me) et bouton Copier.
  const subject = `Demande de devis — ${reference?.title ?? (title || "Création libre")}`;
  const body = [
    "Bonjour David,",
    "",
    "Je souhaite commander une pièce sur mesure et recevoir un devis ferme :",
    `- Référence : ${reference?.title ?? "Création libre"}`,
    `- Idée / sujet : ${title}`,
    `- Dimensions : ${formatDimensions(quote.widthCm, quote.heightCm)} (${quote.areaCm2.toLocaleString("fr-FR")} cm²)`,
    `- Estimation i-CAC (indicative) : ${formatEur(quote.priceEur)}`,
    "",
    `Nom : ${name}`,
    `Email : ${email}`,
    ...(message ? [`Message : ${message}`] : []),
  ].join("\n");

  function openLink(href: string) {
    // Ouvre le client mail / WhatsApp dans une fenêtre séparée, SANS
    // quitter ni rediriger la page de commande actuelle.
    const link = document.createElement("a");
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function sendEmail(e: React.FormEvent) {
    e.preventDefault();
    openLink(`mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    setSentVia("email");
  }

  function sendWhatsApp() {
    openLink(waLink(body));
    setSentVia("whatsapp");
  }

  async function copyOrder() {
    const text = `${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Repli universel (navigateurs/contexts sans Clipboard API) :
      // sélection via un textarea éphémère + execCommand.
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        setCopied(true);
      } catch {
        // Rien de fiable : l'utilisateur peut copier le texte manuellement.
      }
    }
    setTimeout(() => setCopied(false), 2500);
  }

  if (sentVia) {
    return (
      <div className="card-glass rounded-2xl p-8 text-center">
        <CanvasCheckIcon className="mx-auto h-14 w-14 text-[var(--teal)]" />
        <h2 className="mt-3 text-2xl font-bold">Demande de devis prête !</h2>
        <p className="mt-2 text-white/70">
          {formatDimensions(quote.widthCm, quote.heightCm)} ·{" "}
          <span className="accent-amber font-semibold">≈ {formatEur(quote.priceEur)}</span>{" "}
          <span className="text-sm text-white/50">(estimation indicative)</span>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          {sentVia === "email"
            ? "Votre messagerie s'est ouverte avec le récapitulatif pré-rempli — envoyez-le à l'atelier."
            : "WhatsApp s'est ouvert avec votre demande pré-remplie — envoyez le message à l'atelier."}{" "}
          David vous répond <span className="font-semibold text-white/85">sous 48 h</span> et{" "}
          <span className="font-semibold text-white/85">échange avec vous directement</span>{" "}
          jusqu'à un <span className="font-semibold text-[var(--amber)]">devis ferme : le prix est fixe et garanti</span>.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={sendWhatsApp}
            className="flex items-center gap-2 rounded-lg border border-[var(--teal)]/50 px-5 py-2.5 font-semibold text-[var(--teal)] transition hover:bg-[var(--teal)]/10"
          >
            <WhatsAppIcon className="h-4 w-4" />
            {sentVia === "whatsapp" ? "Rouvrir WhatsApp" : "Envoyer sur WhatsApp"}
          </button>
          <a
            href={`mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
            className="btn-accent flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold"
          >
            <MailIcon className="h-4 w-4" />
            {sentVia === "email" ? "Réouvrir l'email" : "Envoyer par email"}
          </a>
          <button
            type="button"
            onClick={copyOrder}
            className="rounded-lg border border-white/20 px-5 py-2.5 font-semibold text-white/85 transition hover:border-[var(--amber)] hover:text-[var(--amber)]"
          >
            {copied ? "Copié ✓" : "Copier le récapitulatif"}
          </button>
        </div>
        {copied ? (
          <p className="mt-3 text-xs text-emerald-400">
            Récapitulatif copié ! Collez-le dans un email à {site.email}, sur WhatsApp ou en message Instagram.
          </p>
        ) : null}
        <p className="mt-4 text-xs text-white/40">
          Aucun paiement à cette étape : vous validez ensemble le devis (prix fixe),
          puis un acompte lance la toile.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-white/15 bg-[var(--ink-soft)] px-3 py-2.5 text-sm outline-none focus:border-[var(--magenta)]";

  return (
    <form onSubmit={sendEmail} className="grid gap-6 lg:grid-cols-[1fr_360px]">
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
          <p className="mt-1.5 text-xs text-white/50">
            <span className="font-semibold text-white/70">Prix approximatif</span> :
            estimation indicative — après échanges avec l'atelier, vous recevez un{" "}
            <span className="font-semibold text-white/70">devis ferme au tarif fixe</span>.
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
            placeholder="Ambiance, couleurs, délai souhaité, budget…"
            className={inputCls}
          />
        </div>
      </div>

      <aside className="card-glass h-fit rounded-2xl p-6 lg:sticky lg:top-20">
        <h2 className="text-lg font-bold">Votre demande de devis</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-white/60">Surface</dt>
            <dd>{quote.areaCm2.toLocaleString("fr-FR")} cm²</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/60">Dimensions</dt>
            <dd>{formatDimensions(quote.widthCm, quote.heightCm)}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-white/10 pt-3 text-base font-bold">
            <dt>Estimation*</dt>
            <dd className="accent-amber">≈ {formatEur(quote.priceEur)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs leading-relaxed text-white/45">
          *Prix approximatif, à titre indicatif — le <strong className="text-white/70">devis ferme</strong>{" "}
          (tarif fixe) est arrêté ensemble avec l'atelier avant toute commande.
        </p>

        <div className="mt-5 space-y-2.5">
          <button type="submit" className="btn-accent flex w-full items-center justify-center gap-2 rounded-lg py-3 font-bold">
            <MailIcon className="h-4 w-4" />
            Envoyer par email
          </button>
          <button
            type="button"
            onClick={sendWhatsApp}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--teal)]/60 py-3 font-bold text-[var(--teal)] transition hover:bg-[var(--teal)]/10"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Discuter sur WhatsApp
          </button>
          <button
            type="button"
            onClick={copyOrder}
            className="w-full rounded-lg border border-white/15 py-2 text-xs font-semibold text-white/60 transition hover:border-[var(--amber)] hover:text-[var(--amber)]"
          >
            {copied ? "Copié ✓" : "Copier le récapitulatif"}
          </button>
        </div>
        {copied ? (
          <p className="mt-2 text-xs text-emerald-400">
            Copié ! Collez-le dans un email, sur WhatsApp ou Instagram.
          </p>
        ) : null}

        <div className="mt-4">
          <LeadTimeNote />
        </div>
        <p className="mt-3 text-xs text-white/40">
          Devis gratuit, sans engagement. Le moyen de paiement (virement, chèque ou
          retrait à l'atelier de Barjols) est convenu ensemble.
        </p>
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
