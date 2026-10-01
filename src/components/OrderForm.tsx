"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MIN_CM, formatDimensions, formatEur, quoteCommission } from "@/lib/pricing";
import type { Artwork } from "@/lib/types";
import { WallPreview } from "@/components/WallPreview";
import { CanvasCheckIcon, MailIcon, WhatsAppIcon } from "@/components/icons";
import { site, waLink } from "@/lib/site";

const MAX_CM = 300;

/** Lit une dimension passée dans l'adresse (?w=100&h=80), bornée aux limites de l'atelier. */
function paramCm(value: string | null, fallback: number): number {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n > 0 ? Math.min(MAX_CM, Math.max(MIN_CM, n)) : fallback;
}

function OrderFormInner({ artworks }: { artworks: Artwork[] }) {
  const params = useSearchParams();

  const [referenceId, setReferenceId] = useState(params.get("ref") ?? "");
  const [title, setTitle] = useState("");
  const [widthCm, setWidthCm] = useState(() => paramCm(params.get("w"), 60));
  const [heightCm, setHeightCm] = useState(() => paramCm(params.get("h"), 80));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sentVia, setSentVia] = useState<"email" | "whatsapp" | null>(null);
  const [copied, setCopied] = useState(false);

  // Une fois la demande partie, la confirmation est amenée à l'écran
  // (sur téléphone, le bouton d'envoi est tout en bas du formulaire).
  const doneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (sentVia) doneRef.current?.scrollIntoView({ block: "center" });
  }, [sentVia]);

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
  const mailHref = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

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
    openLink(mailHref);
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
      // Repli universel (navigateurs/contextes sans Clipboard API) :
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
      <div ref={doneRef} className="panel mx-auto max-w-2xl scroll-mt-28 text-center">
        <CanvasCheckIcon className="mx-auto h-14 w-14 text-[var(--jaune)]" />
        <h2 className="poster t-md mt-4">Votre demande est prête</h2>
        <p className="soft mt-3">
          {formatDimensions(quote.widthCm, quote.heightCm)}, estimation indicative{" "}
          <span className="font-bold text-[var(--jaune)]">{formatEur(quote.priceEur)}</span>.
        </p>
        <p className="soft mt-3">
          {sentVia === "email"
            ? "Votre messagerie s'est ouverte avec le récapitulatif : il reste à l'envoyer."
            : "WhatsApp s'est ouvert avec votre demande : il reste à envoyer le message."}{" "}
          David vous répond sous 48 h et fixe avec vous un devis ferme. Aucun paiement à cette
          étape.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-x-4 gap-y-4">
          <button type="button" onClick={sendWhatsApp} className="btn btn-sm btn-wa">
            <WhatsAppIcon className="h-4 w-4" />
            {sentVia === "whatsapp" ? "Rouvrir WhatsApp" : "Envoyer sur WhatsApp"}
          </button>
          <a href={mailHref} className="btn btn-sm">
            <MailIcon className="h-4 w-4" />
            {sentVia === "email" ? "Rouvrir l'email" : "Envoyer par email"}
          </a>
          <button type="button" onClick={copyOrder} className="btn btn-sm btn-ghost">
            {copied ? "Récapitulatif copié" : "Copier le récapitulatif"}
          </button>
        </div>
        <p className="faint small mt-5" aria-live="polite">
          {copied
            ? `Collez-le dans un email à ${site.email}, sur WhatsApp ou en message Instagram.`
            : "Rien ne s'est ouvert ? Copiez le récapitulatif et envoyez-le par le canal de votre choix."}
        </p>
      </div>
    );
  }

  const dimension = (
    label: string,
    value: number,
    set: React.Dispatch<React.SetStateAction<number>>
  ) => (
    <div className="flex-1">
      <label className="field-label">
        {label} <span className="faint font-normal">(cm)</span>
        <input
          type="number"
          inputMode="numeric"
          min={MIN_CM}
          max={MAX_CM}
          step={1}
          value={value || ""}
          onChange={(e) => set(Math.max(0, Number(e.target.value) || 0))}
          onBlur={() => set((s) => Math.min(MAX_CM, Math.max(MIN_CM, Math.floor(s) || MIN_CM)))}
          className="field mt-2 font-bold tabular-nums"
        />
      </label>
    </div>
  );

  return (
    <form onSubmit={sendEmail} className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14">
      <div className="space-y-9">
        <fieldset className="min-w-0">
          <legend className="field-label">Une toile de référence</legend>
          <p className="soft small mb-3">
            Choisissez celle dont l'esprit vous parle, ou partez d'une page blanche.
          </p>
          <div className="ref-strip">
            <button
              type="button"
              className="ref-tile p-1.5"
              aria-pressed={referenceId === ""}
              onClick={() => setReferenceId("")}
            >
              Création libre
            </button>
            {artworks.map((a) => (
              <button
                key={a.id}
                type="button"
                className="ref-tile"
                aria-pressed={referenceId === a.id}
                aria-label={a.title}
                title={a.title}
                onClick={() => setReferenceId(a.id)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.medium ?? a.image} alt="" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
          <p className="small mt-1" aria-live="polite">
            <span className="soft">Référence : </span>
            <span className="font-bold">{reference?.title ?? "création libre"}</span>
          </p>
        </fieldset>

        <label className="field-label">
          Votre idée, le sujet de la toile
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Un taureau pop art pour le salon"
            className="field mt-2 font-normal"
          />
        </label>

        <fieldset className="min-w-0">
          <legend className="field-label">Le format</legend>
          <div className="flex items-end gap-3">
            {dimension("Largeur", widthCm, setWidthCm)}
            <span className="faint pb-3 text-xl" aria-hidden="true">
              ×
            </span>
            {dimension("Hauteur", heightCm, setHeightCm)}
          </div>
          <p className="soft small mt-3">
            De {MIN_CM} à {MAX_CM} cm par côté. Surface : {quote.areaCm2.toLocaleString("fr-FR")} cm².
            Format i-CAC le plus proche : {quote.refLabel}, {formatEur(quote.refPriceEur)}.
          </p>
        </fieldset>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <label className="field-label">
            Votre nom
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="field mt-2 font-normal"
            />
          </label>
          <label className="field-label">
            Votre email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="field mt-2 font-normal"
            />
          </label>
        </div>

        <label className="field-label">
          Un mot pour David <span className="faint font-normal">(facultatif)</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Ambiance, couleurs, délai souhaité, budget…"
            className="field mt-2 font-normal"
          />
        </label>
      </div>

      <aside className="lg:sticky lg:top-28">
        <WallPreview widthCm={quote.widthCm} heightCm={quote.heightCm} image={reference?.image} />
        <div className="panel border-t-0">
          <p className="soft small">Estimation pour {formatDimensions(quote.widthCm, quote.heightCm)}</p>
          <p className="poster price mt-1" aria-live="polite">
            {formatEur(quote.priceEur).replace(",00", "")}
          </p>
          <p className="soft small mt-2">
            Prix indicatif, d'après la cote i-CAC. Le devis ferme est fixé avec l'atelier avant
            toute commande.
          </p>

          <div className="mt-6 grid gap-4">
            <button type="submit" className="btn w-full">
              <MailIcon className="h-5 w-5" />
              Envoyer par email
            </button>
            <button type="button" onClick={sendWhatsApp} className="btn btn-wa w-full">
              <WhatsAppIcon className="h-5 w-5" />
              Envoyer sur WhatsApp
            </button>
            <button type="button" onClick={copyOrder} className="link small justify-self-center">
              {copied ? "Récapitulatif copié" : "Copier le récapitulatif"}
            </button>
          </div>

          <p className="small soft mt-6 border-l-4 border-[var(--cyan)] pl-4">
            Délai habituel : <span className="font-bold text-[var(--fg)]">3 à 6 semaines</span>{" "}
            après validation du devis. Acompte au lancement, solde à la livraison.
          </p>
        </div>
      </aside>
    </form>
  );
}

export function OrderForm({ artworks }: { artworks: Artwork[] }) {
  return (
    <Suspense fallback={<p className="soft">Chargement du formulaire…</p>}>
      <OrderFormInner artworks={artworks} />
    </Suspense>
  );
}
