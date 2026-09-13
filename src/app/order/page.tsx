import { OrderForm } from "@/components/OrderForm";
import { Reveal } from "@/components/Reveal";
import { readArtworks } from "@/lib/artworks";


export const metadata = {
  title: "Commander — David Drioton",
  description: "Commandez une pièce sur mesure, peinte à l'atelier de Barjols.",
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
            Chaque toile est peinte à la main à l'atelier de Barjols. Choisissez
            une référence, donnez la taille au centimètre : l'estimation suit la
            cote officielle i-CAC, et l'atelier vous répond avec un devis ferme.
          </p>
        </Reveal>
        {/* The three steps, readable before the form */}
        <Reveal delay={0.24}>
          <ol className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              ["1", "Choisissez", "une référence ou une idée libre"],
              ["2", "Dimensionnez", "au centimètre — estimation en direct"],
              ["3", "Envoyez", "le récapitulatif : David confirme le devis"],
            ].map(([n, t, d]) => (
              <li key={n} className="card-glass rounded-xl p-4">
                <p className="accent-text text-lg font-black">{n}</p>
                <p className="mt-1 text-sm font-bold">{t}</p>
                <p className="mt-0.5 text-xs leading-snug text-white/55">{d}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </header>
      <div className="mt-10">
        <OrderForm artworks={artworks} />
      </div>
    </div>
  );
}
