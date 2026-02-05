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
  searchParams: Promise<{ page?: string; search?: string; category?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const category = params.category || "";
  const sort = params.sort || "popular";

  const where = {
    isActive: true,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(category && category !== "all" && {
      storeCategories: {
        some: {
          storeCategory: {
            slug: category,
          },
        },
      },
    }),
  };

  // Determine sort order
  let orderBy: any = { createdAt: "desc" }; // default: newest
  if (sort === "popular") {
    orderBy = { products: { _count: "desc" } };
  } else if (sort === "az") {
    orderBy = { name: "asc" };
  } else if (sort === "products") {
    orderBy = { products: { _count: "desc" } };
  }

  const [stores, totalCount, storeCategories] = await Promise.all([
    prisma.store.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        theme: true,
        updatedAt: true,
        createdAt: true,
        _count: {
          select: {
            products: { where: { isActive: true } },
            categories: { where: { isActive: true } },
          },
        },
      },
      orderBy,
      skip: (page - 1) * STORES_PER_PAGE,
      take: STORES_PER_PAGE,
    }),
    prisma.store.count({ where }),
    prisma.storeCategory.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  // Sort stores by product count to determine top 4 featured stores
  const sortedByProducts = [...stores].sort((a, b) => b._count.products - a._count.products);
  const topFeaturedIds = new Set(sortedByProducts.slice(0, 4).map(s => s.id));

  const storesWithBranding = stores.map((store) => {
    const merged = mergeTheme(
      (store.theme ?? undefined) as StoreTheme | undefined,
    );
    const branding = merged.branding;

    const productCount = store._count.products;
    const categoryCount = store._count.categories;

    // Calculate if store is new (created in last 7 days)
    const isNew = new Date().getTime() - new Date(store.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;

    // Top 4 stores with most products are featured
    const isFeatured = topFeaturedIds.has(store.id);

    return {
      ...store,
      branding,
      productCount,
      categoryCount,
      isNew,
      isFeatured,
    };
  });

  const totalPages = Math.ceil(totalCount / STORES_PER_PAGE);

  return (
    <div className="text-foreground flex flex-col">
      <Header />
      <LandingContent
        stores={storesWithBranding}
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        searchQuery={search}
        storeCategories={storeCategories}
        selectedCategory={category}
        selectedSort={sort}
      />
      <Footer />
    </div>
  );
}
