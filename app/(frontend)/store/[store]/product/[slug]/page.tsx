import "@/app/globals.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/number";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/products/product-card";
import { CategoryBarWrapper } from "@/components/categories/category-bar-wrapper";
import { Header } from "@/components/layout/header";
import { StoreThemeProvider } from "@/components/theme/store-theme-provider";
import type { StoreTheme } from "@/lib/theme";
import { LoadingProvider } from "@/components/utils/loading-context";
import { NavigationLoadingBar } from "@/components/utils/navigation-loading";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { RichTextRenderer } from "@/components/utils/rich-text-editor";
import { ProductDetailClient } from "./product-detail-client";

interface ProductDetailPageProps {
  params: Promise<{
    store: string;
    slug: string;
  }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug, store: storeSlug } = await params;

  const store = await prisma.store.findUnique({
    where: { slug: storeSlug, isActive: true },
  });
  if (!store) {
    notFound();
  }

  const storeTheme = (store.theme ?? null) as unknown as StoreTheme | null;

  const product = await prisma.product.findFirst({
    where: {
      slug,
      isActive: true,
      storeId: store.id,
    },
    include: {
      category: true,
      subcategory: true,
      prices: { include: { currency: true } },
      coverImages: true,
      variants: {
        where: { isActive: true },
        include: {
          prices: { include: { currency: true } },
          images: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const coverImages = (product.coverImages as any[]) || [];
  const imageData = coverImages[0];
  const primaryImageUrl = imageData?.url || "";
  const primaryImageAlt = imageData?.alt || product.name;

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
      storeId: store.id,
    },
    include: {
      category: true,
      prices: { include: { currency: true } },
      coverImages: true,
    },
    take: 4,
  });

  const category = product.category;
  const categoryName = category?.name || "Categoría";
  const categorySlug = category?.slug || "";

  const specifications = product.specifications as any;
  const tags = product.tags as any;

  const serializedProduct = {
    ...product,
    coverImages: coverImages.map((img: any) => ({
      ...img,
      url: img.url,
      alt: img.alt,
    })),
    prices: product.prices.map((p: any) => ({
      ...p,
      amount: toNumber(p.amount),
      saleAmount: p.saleAmount ? toNumber(p.saleAmount) : null,
    })),
    variants: product.variants.map((v: any) => ({
      ...v,
      prices: v.prices.map((p: any) => ({
        ...p,
        amount: toNumber(p.amount),
        saleAmount: p.saleAmount ? toNumber(p.saleAmount) : null,
      })),
    })),
    specifications,
    tags,
    primaryImageUrl,
    primaryImageAlt,
    currency: product.prices[0]?.currency || null,
  };

  const parseNumeric = (value: any) => toNumber(value ?? 0);

  return (
    <StoreThemeProvider theme={storeTheme ?? undefined}>
      <LoadingProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <NavigationLoadingBar />
          <Header store={store} />
          <CategoryBarWrapper
            storeSlug={storeSlug}
            selectedCategorySlug={categorySlug}
          />

          <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={`/store/${storeSlug}`}>Inicio</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  {category && (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link
                            href={`/store/${storeSlug}?category=${categorySlug}`}
                          >
                            {categoryName}
                          </Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                    </>
                  )}
                  <BreadcrumbItem>
                    <BreadcrumbPage>{product.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <ProductDetailClient product={serializedProduct} />

            {product.description && (
              <Card className="mb-16">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">Descripción</h2>
                  <RichTextRenderer content={product.description} />
                </CardContent>
              </Card>
            )}

            {relatedProducts.length > 0 && (
              <div className="mb-24">
                <h2 className="text-2xl font-bold mb-6 text-foreground">
                  Productos relacionados
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((relatedProduct) => {
                    const relatedCoverImages =
                      (relatedProduct.coverImages as any[]) || [];
                    const relatedImageData = relatedCoverImages[0];
                    const relatedImageUrl = relatedImageData?.url || "";

                    const relatedDefaultPriceObj =
                      (relatedProduct as any).prices?.find(
                        (p: any) => p.isDefault,
                      ) || (relatedProduct as any).prices?.[0];
                    const relatedPrice = relatedDefaultPriceObj
                      ? parseNumeric(
                          relatedDefaultPriceObj.saleAmount ??
                            relatedDefaultPriceObj.amount,
                        )
                      : 0;
                    const relatedRegularPrice = relatedDefaultPriceObj
                      ? relatedDefaultPriceObj.saleAmount
                        ? parseNumeric(relatedDefaultPriceObj.amount)
                        : undefined
                      : undefined;
                    const relatedCurrency =
                      relatedDefaultPriceObj?.currency ?? null;

                    return (
                      <ProductCard
                        key={relatedProduct.id}
                        id={relatedProduct.id}
                        name={relatedProduct.name}
                        description={relatedProduct.shortDescription || ""}
                        storeSlug={storeSlug}
                        price={relatedPrice}
                        regularPrice={relatedRegularPrice}
                        currency={relatedCurrency}
                        image={relatedImageUrl}
                        imageAlt={relatedImageData?.alt}
                        slug={relatedProduct.slug}
                        featured={relatedProduct.featured}
                        inStock={relatedProduct.inStock}
                        unit={(relatedProduct.specifications as any)?.unit}
                        weight={(relatedProduct.specifications as any)?.weight}
                        weightUnit={
                          (relatedProduct.specifications as any)?.weightUnit
                        }
                        volume={(relatedProduct.specifications as any)?.volume}
                        volumeUnit={
                          (relatedProduct.specifications as any)?.volumeUnit
                        }
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        </div>
      </LoadingProvider>
    </StoreThemeProvider>
  );
}
