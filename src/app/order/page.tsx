import { OrderForm } from "@/components/OrderForm";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { Faq, Guarantees } from "@/components/commercial";
import { readArtworks } from "@/lib/artworks";

export const metadata = {
  title: "Commander une toile",
  description:
    "Demandez votre devis gratuit pour une pièce sur mesure peinte à l'atelier de Barjols : estimation i-CAC en direct, échange direct avec l'artiste, tarif fixe garanti.",
};

const steps = [
  { t: "Décrivez", d: "Votre idée, la taille au centimètre, une toile de référence." },
  { t: "Échangez", d: "David répond sous 48 h, par email ou WhatsApp." },
  { t: "Validez", d: "Un devis ferme, à prix fixe. Puis la toile entre à l'atelier." },
];

export default async function OrderPage() {
  const artworks = await readArtworks();

  return (
    <>
      <PageHero title="Commander une toile">
        <p className="lead">
          Chaque toile est peinte à la main à l'atelier de Barjols. Décrivez votre projet :
          l'estimation s'affiche en direct selon la cote officielle i-CAC, puis vous recevez un
          devis ferme. Gratuit, sans engagement.
        </p>
        {/* Les trois temps de la commande : une vraie suite, donc numérotée */}
        <ol className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.t} className="border-t-2 border-[var(--fg)] pt-3">
              <p className="poster t-md">
                <span className="text-[var(--jaune)]">{i + 1}.</span> {s.t}
              </p>
              <p className="soft small mt-2">{s.d}</p>
            </li>
          ))}
        </ol>
      </PageHero>

      <section className="bloc bloc-noir pb-[clamp(4.5rem,11vw,9rem)]">
        <div className="wrap">
          <OrderForm artworks={artworks} />
        </div>
      </section>

      <Section tone="papier" torn={17}>
        <Guarantees />
      </Section>

      <Section tone="noir" torn={18}>
        <Faq />
      </Section>
    </>
  );
}
