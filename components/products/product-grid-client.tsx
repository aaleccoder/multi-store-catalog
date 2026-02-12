"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "./product-card";
import { toNumber } from "@/lib/number";
import { ProductGridSkeleton } from "./product-grid-skeleton";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { trpc } from "@/trpc/client";
import { SearchAndFiltersBar } from "../search/search-and-filter-mobile";
import { FilterSheet } from "@/components/filters/filter-sheet";

interface ProductGridClientProps {
  storeSlug: string;
  categorySlug?: string;
  subcategorySlug?: string;
  filterContent?: React.ReactNode;
}

const MIN_CARD_WIDTH = 280;
const MAX_DESKTOP_COLUMNS = 6;

export const ProductGridClient = ({
  storeSlug,
  categorySlug,
  subcategorySlug,
  filterContent,
}: ProductGridClientProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [maxColumns, setMaxColumns] = useState(4);

  const currentSort = searchParams.get("sort") || "-createdAt";
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const mobileView = searchParams.get("view") === "list" ? "list" : "grid";
  const mobileCols = mobileView === "list" ? 1 : 2;
  const colsParam = parseInt(searchParams.get("cols") || "", 10);

  // tRPC queries
  const categoryQuery = trpc.categories.list.useQuery(
    { storeSlug, slug: categorySlug },
    { enabled: !!storeSlug && !!categorySlug },
  );
  const selectedCategory = categorySlug
    ? categoryQuery.data?.docs?.[0] || null
    : null;

  const subcategoryQuery = trpc.subcategories.list.useQuery(
    subcategorySlug && selectedCategory
      ? { storeSlug, slug: subcategorySlug, categoryId: selectedCategory.id }
      : { storeSlug },
    { enabled: !!storeSlug && !!subcategorySlug },
  );
  const selectedSubcategory = subcategoryQuery.data?.docs?.[0] || null;

  const productsQuery = trpc.products.list.useQuery(
    {
      storeSlug,
      page: pageFromUrl.toString(),
      limit: "12",
      sort: currentSort,
      category: selectedCategory?.id,
      subcategory: selectedSubcategory?.id,
      inStock: searchParams.get("inStock") || undefined,
      featured: searchParams.get("featured") || undefined,
      search: searchParams.get("search") || undefined,
      currency: searchParams.get("currency") || undefined,
      price: searchParams.get("price") || undefined,
    },
    { enabled: !!storeSlug },
  );
  const products = productsQuery.data?.docs || [];
  const totalPages = productsQuery.data?.totalPages || 1;
  const totalDocs = productsQuery.data?.totalDocs || 0;
  const currentPage = productsQuery.data?.page || 1;

  const loading =
    categoryQuery.isLoading ||
    subcategoryQuery.isLoading ||
    productsQuery.isLoading;

  useEffect(() => {
    const element = gridRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const updateColumns = () => {
      const width = element.clientWidth || 0;
      const nextMax = Math.max(2, Math.floor(width / MIN_CARD_WIDTH));
      setMaxColumns(Math.min(nextMax, MAX_DESKTOP_COLUMNS));
    };

    updateColumns();
    const observer = new ResizeObserver(updateColumns);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const clampColumns = (value: number) =>
    Math.min(Math.max(value, 2), Math.min(maxColumns, MAX_DESKTOP_COLUMNS));
  const fallbackCols = Math.min(3, maxColumns);
  const desktopCols = Number.isFinite(colsParam)
    ? clampColumns(colsParam)
    : fallbackCols;

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    const qs = params.toString();
    router.push(qs ? `/store/${storeSlug}?${qs}` : `/store/${storeSlug}`);
  };

  const handleSortChange = (value: string) => {
    updateSearchParams({
      sort: value === "-createdAt" ? null : value,
      page: null,
    });
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page === 1 ? null : page.toString() });
    // Scroll to top of product grid
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <ProductGridSkeleton
        mobileView={mobileView}
        desktopColumns={desktopCols}
      />
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="w-full">
        <div className="p-6 md:p-8">
          {/* Breadcrumb */}
          {(selectedCategory || selectedSubcategory) && (
            <div className="mb-4">
              <Link
                href={`/store/${storeSlug}`}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Volver a todos los productos</span>
              </Link>
            </div>
          )}

          {/* Search Query Display */}
          {searchParams.get("search") && (
            <div className="mb-4">
              <p className="text-lg font-semibold">
                Resultados de búsqueda para &quot;{searchParams.get("search")}&quot;
              </p>
            </div>
          )}

          {/* Filters and Sorting - Same as when products exist */}
          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-row items-center justify-between w-full">
              <p className="text-sm text-muted-foreground">
                No se encontraron productos
              </p>
              <SearchAndFiltersBar
                storeSlug={storeSlug}
                filterContent={filterContent}
              />
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Select value={currentSort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[200px] text-foreground">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-createdAt">Más recientes</SelectItem>
                  <SelectItem value="createdAt">Más antiguos</SelectItem>
                  <SelectItem value="name">Nombre (A-Z)</SelectItem>
                  <SelectItem value="-name">Nombre (Z-A)</SelectItem>
                  <SelectItem value="price">Precio (menor a mayor)</SelectItem>
                  <SelectItem value="-price">Precio (mayor a menor)</SelectItem>
                  <SelectItem value="-featured">Destacados primero</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="hidden md:block w-64 shrink-0">
              {filterContent}
            </div>
            <div className="flex-1">
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchParams.get("search")
                    ? `No se encontraron productos para "${searchParams.get("search")}"`
                    : `No hay productos disponibles ${categorySlug ? "en esta categoría" : "en este momento"
                    }.`}
                </p>
              </div>
            </div>
          </div>
        </div>
        <FilterSheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          {filterContent}
        </FilterSheet>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="p-4 md:p-8 mb-12">
        {/* Breadcrumb */}
        {(selectedCategory || selectedSubcategory) && (
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm">
              <Link
                href={`/store/${storeSlug}`}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Inicio
              </Link>
              <span className="text-muted-foreground">/</span>
              {selectedCategory && (
                <>
                  <Link
                    href={`/store/${storeSlug}?category=${categorySlug}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {selectedCategory.name}
                  </Link>
                  {selectedSubcategory && (
                    <>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-foreground font-medium">
                        {selectedSubcategory.name}
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Search Query Display */}
        {searchParams.get("search") && (
          <div className="mb-4">
            <p className="text-lg font-semibold">
              Resultados de búsqueda para &quot;{searchParams.get("search")}&quot;
            </p>
          </div>
        )}

        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-row items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              Mostrando {products.length > 0 ? (currentPage - 1) * 12 + 1 : 0} -{" "}
              {Math.min(currentPage * 12, totalDocs)} de {totalDocs}{" "}
              {totalDocs === 1 ? "producto" : "productos"}
            </p>
            <SearchAndFiltersBar
              storeSlug={storeSlug}
              filterContent={filterContent}
            />
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Select
              value={desktopCols.toString()}
              onValueChange={(value) =>
                updateSearchParams({ cols: value === "3" ? null : value })
              }
            >
              <SelectTrigger className="w-[160px] text-foreground">
                <SelectValue placeholder="Columnas" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  { length: Math.max(0, Math.min(maxColumns, MAX_DESKTOP_COLUMNS) - 1) },
                  (_, i) => {
                    const cols = i + 2;
                    return (
                      <SelectItem key={cols} value={cols.toString()}>
                        {cols} columnas
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
            <Select value={currentSort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[200px] text-foreground">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-createdAt">Más recientes</SelectItem>
                <SelectItem value="createdAt">Más antiguos</SelectItem>
                <SelectItem value="name">Nombre (A-Z)</SelectItem>
                <SelectItem value="-name">Nombre (Z-A)</SelectItem>
                <SelectItem value="price">Precio (menor a mayor)</SelectItem>
                <SelectItem value="-price">Precio (mayor a menor)</SelectItem>
                <SelectItem value="-featured">Destacados primero</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="hidden md:block w-64 shrink-0">
            {filterContent}
          </div>
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-end md:hidden">
              <div className="inline-flex border border-border overflow-hidden">
                <Button
                  type="button"
                  variant="ghost"
                  className={`h-9 px-3 text-xs ${mobileView === "list" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                  onClick={() => updateSearchParams({ view: "list" })}
                >
                  Lista
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className={`h-9 px-3 text-xs ${mobileView === "grid" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                  onClick={() => updateSearchParams({ view: null })}
                >
                  Grid
                </Button>
              </div>
            </div>
            <div
              ref={gridRef}
              className={`grid auto-rows-fr gap-6 ${mobileCols === 1 ? "grid-cols-1" : "grid-cols-2"} md:grid-cols-[repeat(var(--grid-cols),minmax(0,1fr))]`}
              style={
                { "--grid-cols": desktopCols } as React.CSSProperties
              }
            >
              {products.map((product: any) => {
                const imageData = product.coverImages?.[0];
                const imageUrl = imageData?.url || "";

                // Prepare all images for carousel
                const images = product.coverImages
                  ?.map((img: any) => ({
                    url: img.url || "",
                    alt: img.alt || product.name,
                  }))
                  .filter((img: any) => img.url); // Filter out images without URL

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.shortDescription || ""}
                    storeSlug={storeSlug}
                    price={(() => {
                      // Check for variants first
                      if (product.variants && product.variants.length > 0) {
                        const variantPrices = product.variants
                          .filter(
                            (v: any) => v.isActive && v.prices?.length > 0,
                          )
                          .flatMap((v: any) => v.prices)
                          .map((p: any) => toNumber(p.saleAmount ?? p.amount))
                          .filter((p: number) => !isNaN(p));

                        if (variantPrices.length > 0) {
                          return Math.min(...variantPrices);
                        }
                      }

                      const rawPrice =
                        product.prices?.find((p: any) => p.isDefault)
                          ?.saleAmount ??
                        product.prices?.find((p: any) => p.isDefault)?.amount ??
                        0;

                      return toNumber(rawPrice);
                    })()}
                    pricePrefix={
                      product.variants && product.variants.length > 0
                        ? "Desde"
                        : undefined
                    }
                    regularPrice={(() => {
                      if (product.variants && product.variants.length > 0)
                        return undefined; // Don't show regular price for variants range
                      const raw =
                        product.prices?.find((p: any) => p.isDefault)?.amount ??
                        0;
                      return toNumber(raw);
                    })()}
                    currency={
                      (product.prices?.find((p: any) => p.isDefault)
                        ?.currency ?? null) as any
                    }
                    image={imageUrl}
                    imageAlt={imageData?.alt || product.name}
                    images={images}
                    slug={product.slug}
                    featured={product.featured || false}
                    inStock={product.inStock || false}
                    unit={product.specifications?.unit}
                    weight={product.specifications?.weight}
                    weightUnit={product.specifications?.weightUnit}
                    volume={product.specifications?.volume}
                    volumeUnit={product.specifications?.volumeUnit}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 mb-12">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    const showEllipsisBefore =
                      page === currentPage - 2 && currentPage > 3;
                    const showEllipsisAfter =
                      page === currentPage + 2 && currentPage < totalPages - 2;

                    if (showEllipsisBefore || showEllipsisAfter) {
                      return (
                        <PaginationItem key={`ellipsis-${page}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    if (!showPage) return null;

                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  },
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        handlePageChange(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
      <FilterSheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        {filterContent}
      </FilterSheet>
    </div>
  );
};
