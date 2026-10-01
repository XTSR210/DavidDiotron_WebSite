import type { Metadata } from "next";

// Espace privé : jamais dans les moteurs de recherche.
export const metadata: Metadata = {
  title: "Atelier",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
