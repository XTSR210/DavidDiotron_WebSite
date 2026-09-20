import { OrderForm } from "@/components/OrderForm";
import { Guarantees, Testimonials } from "@/components/commercial";
import { Reveal } from "@/components/Reveal";
import { readArtworks } from "@/lib/artworks";


export const metadata = {
  title: "Commander & devis — David Drioton",
  description:
    "Demandez votre devis gratuit pour une pièce sur mesure peinte à l'atelier de Barjols : estimation i-CAC en direct, échange direct avec l'artiste, tarif fixe garanti.",
};

export default async function OrderPage() {
  const artworks = await readArtworks();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
      <header className="max-w-2xl">
        <Reveal>
          <p className="eyebrow">Commission · i-CAC</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="display-1 mt-4">
            Commander une <span className="accent-text">pièce sur mesure</span>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-5 leading-relaxed text-white/60">
            Chaque toile est peinte à la main à l'atelier de Barjols. Décrivez
            votre projet : l'estimation s'affiche en direct selon la cote
            officielle i-CAC, vous en discutez directement avec David (email ou
            WhatsApp), puis vous recevez un <strong className="text-white/85">devis ferme —
            tarif fixe et garanti</strong>. Aucune surprise.
          </p>
        </Reveal>
        {/* Le parcours devis, lisible avant le formulaire */}
        <Reveal delay={0.24}>
          <ol className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              ["1", "Décrivez", "votre idée, la taille au cm, la référence"],
              ["2", "Discutez", "avec David — réponse sous 48 h, email ou WhatsApp"],
              ["3", "Devis ferme", "tarif fixe validé ensemble, puis création"],
            ].map(([n, t, d]) => (
              <li key={n} className="card-glass rounded-xl p-4">
                <p className="accent-text text-lg font-black">{n}</p>
                <p className="mt-1 text-sm font-bold">{t}</p>
                <p className="mt-0.5 text-xs leading-snug text-white/55">{d}</p>
              </li>
            ))}
          </ol>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold uppercase tracking-wider text-white/45">
            <span>Devis gratuit</span>
            <span aria-hidden className="text-[var(--magenta)]">·</span>
            <span>Sans engagement</span>
            <span aria-hidden className="text-[var(--magenta)]">·</span>
            <span>Prix fixe une fois le devis validé</span>
          </p>
        </Reveal>
      </header>
      <div className="mt-10">
        <OrderForm artworks={artworks} />
      </div>
      <Testimonials />
      <Guarantees />
    </div>
  );
}
