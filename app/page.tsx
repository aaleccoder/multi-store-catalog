import { prisma } from "@/lib/db";
import { mergeTheme, type StoreTheme } from "@/lib/theme";
import Header from "@/components/wholepage/Header";
import Footer from "@/components/wholepage/Footer";
import LandingContent from "@/components/LandingContent";

// Enable ISR with 1 minute revalidation
export const revalidate = 60;

const STORES_PER_PAGE = 12;

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";

  const where = {
    isActive: true,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [stores, totalCount] = await Promise.all([
    prisma.store.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        theme: true,
      },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * STORES_PER_PAGE,
      take: STORES_PER_PAGE,
    }),
    prisma.store.count({ where }),
  ]);

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

  const totalPages = Math.ceil(totalCount / STORES_PER_PAGE);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <LandingContent
        stores={storesWithBranding}
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        searchQuery={search}
      />
      <Footer />
    </div>
  );
}
