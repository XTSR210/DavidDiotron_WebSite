import { OrderForm } from "@/components/OrderForm";
import { readArtworks } from "@/lib/artworks";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Commander — David Drioton",
  description: "Commandez une pièce sur mesure, peinte à l'atelier de Barjols.",
};

export default async function OrderPage() {
  const artworks = await readArtworks();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-black">
        Commander une <span className="accent-text">pièce sur mesure</span>
      </h1>
      <p className="mt-2 max-w-2xl text-white/60">
        Chaque toile est peinte à la main à l'atelier de Barjols. Choisissez une
        référence, donnez la taille au centimètre, et l'atelier vous répond.
      </p>
      <div className="mt-8">
        <OrderForm artworks={artworks} />
      </div>
    </div>
  );
}
