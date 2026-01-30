import { prisma } from "@/lib/db";
import { mergeTheme, defaultStoreBranding, type StoreTheme } from "@/lib/theme";
import Header from "@/components/wholepage/Header";
import LandingContent from "@/components/LandingContent";

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
    const branding = merged.branding ?? defaultStoreBranding;

    return {
      ...store,
      branding,
    };
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <LandingContent stores={storesWithBranding} />
    </div>
  );
}
