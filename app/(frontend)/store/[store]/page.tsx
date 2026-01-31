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

// Enable ISR with 1 minute revalidation
export const revalidate = 60;

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

  // Get logo from theme for OpenGraph image
  const storeTheme = (rawStore.theme as any) ?? {};
  const logoUrl = storeTheme?.branding?.logoUrl;
  const ogImage = logoUrl || faviconPath;

  const title = store.name;
  const description = store.description || `Welcome to ${store.name} - Shop our collection of quality products.`;
  const canonicalUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000"}/store/${storeSlug}`;

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    keywords: [store.name, "online store", "shopping", "e-commerce"],
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://localhost:3000"),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: title,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${store.name} Logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: faviconPath,
      shortcut: faviconPath,
      apple: faviconPath,
    },
    manifest: `/store/${storeSlug}/manifest.json`,
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
