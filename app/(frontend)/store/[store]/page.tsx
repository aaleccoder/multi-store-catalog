import React from "react";
import "@/app/globals.css";
import { Header } from "@/components/layout/header";
import { CategoryBarWrapper } from "@/components/categories/category-bar-wrapper";
import { getFilterContent } from "@/components/filters/filter-sidebar";
import { ProductGridClient } from "@/components/products/product-grid-client";
import { NavigationLoadingBar } from "@/components/utils/navigation-loading";
import { LoadingProvider } from "@/components/utils/loading-context";
import { PageLayoutWrapper } from "@/components/layout/page-layout-wrapper";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { StoreThemeProvider } from "@/components/theme/store-theme-provider";
import type { StoreTheme } from "@/lib/theme";
import { Metadata } from "next";
import { storeSchema } from "@/server/api/routers/admin/stores";

interface HomePageProps {
  params: Promise<{
    store: string;
  }>;
  searchParams: Promise<{
    category?: string;
    subcategory?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { store: storeSlug } = await params;

  const rawStore = await prisma.store.findFirst({
    where: { slug: storeSlug, isActive: true },
  });
  if (!rawStore) {
    return {
      title: "Store Not Found",
    };
  }
  const store = storeSchema.parse(rawStore);

  // Add cache-busting timestamp to force browser to refresh favicon
  const cacheBuster = rawStore.updatedAt.getTime();
  const faviconPath = `/store/${storeSlug}/favicon.png?v=${cacheBuster}`;

  return {
    title: store.name,
    description: store.description || `Welcome to ${store.name} store!`,
    icons: {
      icon: faviconPath,
      shortcut: faviconPath,
      apple: faviconPath,
    },
  };
}

export default async function HomePage({
  params,
  searchParams,
}: HomePageProps) {
  const { store: storeSlug } = await params;
  const queryParams = await searchParams;
  const categorySlug = queryParams.category;
  const subcategorySlug = queryParams.subcategory;

  const store = await prisma.store.findFirst({
    where: { slug: storeSlug, isActive: true },
  });
  if (!store) {
    notFound();
  }

  console.log(store);

  const filterContent = await getFilterContent(
    storeSlug,
    store.id,
    categorySlug,
    subcategorySlug,
  );
  const storeTheme = (store.theme ?? null) as unknown as StoreTheme | null;

  console.log("Store Theme:", storeTheme);

  return (
    <StoreThemeProvider theme={storeTheme ?? undefined}>
      <LoadingProvider>
        <div className="min-h-screen bg-background flex flex-col pb-16 md:pb-0">
          <NavigationLoadingBar />
          <Header store={store} />
          <CategoryBarWrapper
            storeSlug={storeSlug}
            selectedCategorySlug={categorySlug}
          />
          <PageLayoutWrapper filterContent={filterContent}>
            <div className="flex flex-1">
              <main className="flex-1 ">
                <ProductGridClient
                  storeSlug={storeSlug}
                  categorySlug={categorySlug}
                  subcategorySlug={subcategorySlug}
                  filterContent={filterContent}
                />
              </main>
            </div>
          </PageLayoutWrapper>
        </div>
      </LoadingProvider>
    </StoreThemeProvider>
  );
}
