import { prisma } from "@/lib/db";
import { mergeTheme, defaultStoreBranding, type StoreTheme } from "@/lib/theme";
import Header from "@/components/wholepage/Header";
import LandingContent from "@/components/LandingContent";
import Image from "next/image";

// Enable ISR with 1 minute revalidation
export const revalidate = 60;

export default async function LandingPage() {
  const stores = await prisma.store.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      theme: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const storesWithBranding = stores.map((store) => {
    const merged = mergeTheme(
      (store.theme ?? undefined) as StoreTheme | undefined,
    );
    const branding = merged.branding;

    return {
      ...store,
      branding,
    };
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <LandingContent stores={storesWithBranding} />
      <footer className="bg-muted text-muted-foreground p-4 mt-8">
        <div className="container mx-auto flex flex-col items-center">
          <Image
            src="/android-chrome-192x192.png"
            alt="Logo de Catálogo Multi-Tienda"
            width={48}
            height={48}
            className="mb-2"
          />
          <p className="text-center mb-2">
            Catálogo Multi-Tienda - Tu tienda única para listados de múltiples
            tiendas.
          </p>

          <p className="text-sm">
            &copy; 2023 Catálogo Multi-Tienda. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
