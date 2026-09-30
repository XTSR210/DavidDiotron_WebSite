import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHero title={title} size="lg">
        <p className="soft small">Dernière mise à jour : {updated}</p>
      </PageHero>
      <Section tone="papier" torn={5}>
        <div className="max-w-[46rem] space-y-4">{children}</div>
      </Section>
    </>
  );
}

export function LegalH2({ children }: { children: React.ReactNode }) {
  return <h2 className="poster t-sm border-t-2 border-[var(--fg)] pt-5 !mt-10 first:!mt-0">{children}</h2>;
}
