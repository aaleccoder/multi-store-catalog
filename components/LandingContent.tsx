"use client";

import Image from "next/image";
import Link from "next/link";
import { defaultStoreBranding } from "@/lib/theme";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Cpu,
  Gamepad2,
  Search,
  Shirt,
  Sofa,
  Sparkles,
  Star,
  Store,
  Tag,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LandingContentProps {
  stores: any[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchQuery: string;
  storeCategories: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  }>;
  selectedCategory: string;
  selectedSort: string;
}

const categoryIconMap: Record<string, LucideIcon> = {
  cpu: Cpu,
  sofa: Sofa,
  shirt: Shirt,
  trophy: Trophy,
  sparkles: Sparkles,
  "gamepad-2": Gamepad2,
};

const getCategoryIcon = (icon?: string | null) =>
  (icon ? categoryIconMap[icon] : undefined) ?? Tag;

const LandingContent = ({
  stores,
  currentPage,
  totalPages,
  totalCount,
  searchQuery,
  storeCategories,
  selectedCategory,
  selectedSort,
}: LandingContentProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchQuery);

  const updateParams = (updates: Record<string, string | null>) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset to page 1 when filters change
      if (updates.search !== undefined || updates.category !== undefined || updates.sort !== undefined) {
        params.delete("page");
      }

      router.push(`/?${params.toString()}`);
    });
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    updateParams({ search: value || null });
  };

  const handleCategoryChange = (value: string) => {
    updateParams({ category: value === "all" ? null : value });
  };

  const handleSortChange = (value: string) => {
    updateParams({ sort: value });
  };

  const handlePageChange = (page: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set("page", page.toString());
      router.push(`/?${params.toString()}`);
    });
  };

  const renderPaginationItems = () => {
    const items = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    // Always show first page
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis after first page if needed
    if (showEllipsisStart) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis before last page if needed
    if (showEllipsisEnd) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };
  return (
    <section
      id="stores"
      className="mx-auto max-w-7xl px-6 py-24 lg:py-28"
    >
      <div className="space-y-8 lg:space-y-10">
        {/* Hero conversion block */}
        <div className="relative w-full">
          <div className="mx-auto max-w-7xl px-6">
            <div className="border border-border/60 bg-card bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-7 sm:p-9 lg:p-10">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    ¿Tienes un negocio?
                  </p>
                  <h2 className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
                    Administra tu propio catálogo
                  </h2>
                  <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                    Crea tu propio catálogo digital, vende en línea y llega a más
                    clientes con una tienda lista en minutos.
                  </p>
                </div>
                <Button asChild size="lg" className="shrink-0">
                  <Link href="/info">Crear mi catálogo</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold sm:text-4xl">
              Tiendas Activas
            </h1>
            <p className="text-muted-foreground">
              Explora nuestras marcas y encuentra lo que buscas
            </p>
          </div>
          <span className="text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? "tienda" : "tiendas"}
          </span>
        </div>

        {/* Search Bar with Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar tiendas..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex gap-2">
            <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <span>Todas las categorías</span>
                  </div>
                </SelectItem>
                {storeCategories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const Icon = getCategoryIcon(category.icon);
                        return (
                          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                        );
                      })()}
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSort || "popular"} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Más populares</SelectItem>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="az">A-Z</SelectItem>
                <SelectItem value="products">Más productos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading state overlay */}
        {isPending && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="text-muted-foreground">Cargando...</div>
          </div>
        )}

        {stores.length === 0 ? (
          <div className="border border-dashed border-border/70 bg-card/60 px-6 py-10 text-center text-sm text-muted-foreground">
            {searchQuery
              ? `No se encontraron tiendas que coincidan con "${searchQuery}".`
              : "Aún no hay tiendas activas. Crea la primera desde el panel de administración."}
          </div>
        ) : (
          <>
            {/* Helper function for relative time */}
            {(() => {
              const getRelativeTime = (date: Date) => {
                const now = new Date();
                const diff = now.getTime() - new Date(date).getTime();
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));

                if (days === 0) return "Hoy";
                if (days === 1) return "Hace 1 día";
                if (days < 7) return `Hace ${days} días`;
                if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`;
                if (days < 365) return `Hace ${Math.floor(days / 30)} meses`;
                return `Hace ${Math.floor(days / 365)} años`;
              };

              const renderStoreCard = (store: any, featured = false) => {
                const logoSrc =
                  store.branding.logoUrl ??
                  defaultStoreBranding.logoUrl ??
                  "/android-chrome-192x192.png";
                const logoAlt =
                  store.branding.logoAlt ??
                  defaultStoreBranding.logoAlt ??
                  `${store.name} logo`;

                return (
                  <Link
                    key={store.id}
                    href={`/store/${store.slug}`}
                    className={`group relative flex flex-col overflow-hidden border border-border bg-card transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/50 ${featured ? "col-span-2 lg:col-span-2" : ""
                      }`}
                  >
                    {/* Badge for featured/new stores */}
                    {(store.isFeatured || store.isNew) && (
                      <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                        {store.isFeatured ? (
                          <Star className="h-3.5 w-3.5" aria-hidden />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" aria-hidden />
                        )}
                        <span>{store.isFeatured ? "Destacada" : "Nueva"}</span>
                      </div>
                    )}

                    {/* Logo container with ambient background */}
                    <div className={`relative flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-6 ${featured ? "h-48 lg:h-56" : "h-40"
                      }`}>
                      {/* Logo frame - 1:1 aspect ratio with intentional styling */}
                      <div className={`relative aspect-square bg-background/80 backdrop-blur-sm shadow-sm ring-1 ring-border/50 p-4 overflow-hidden transition-all duration-300 group-hover:shadow-md group-hover:ring-primary/30 ${featured ? "w-32 lg:w-36" : "w-24"
                        }`}>
                        {/* Subtle inner gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-background/50 to-transparent pointer-events-none" />

                        {/* Logo */}
                        <div className="relative h-full w-full flex items-center justify-center">

                          {logoSrc ? (
                            <Image
                              src={logoSrc}
                              alt={logoAlt}
                              width={featured ? 96 : 64}
                              height={featured ? 96 : 64}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Store className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 px-6 py-4 h-full">
                      {/* PRIMARY: Store name */}
                      <h3 className={`font-bold leading-tight tracking-tight group-hover:text-primary transition-colors ${featured ? "text-2xl" : "text-xl"
                        }`}>
                        {store.name}
                      </h3>

                      {/* SECONDARY: Description */}
                      {store.description && (
                        <p className={`text-sm text-muted-foreground/90 leading-snug ${featured ? "line-clamp-3" : "line-clamp-2"
                          }`}>
                          {store.description}
                        </p>
                      )}

                      {/* TERTIARY: Activity signals */}
                      <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-border/50">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                          {/* Active badge */}
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 bg-emerald-500 animate-pulse" />
                            <span>Abierta ahora</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                          {/* Product count */}
                          {store.productCount > 0 && (
                            <span>{store.productCount} {store.productCount === 1 ? "producto" : "productos"}</span>
                          )}

                          {/* Category count */}
                          {store.categoryCount > 0 && (
                            <span>•</span>
                          )}
                          {store.categoryCount > 0 && (
                            <span>{store.categoryCount} {store.categoryCount === 1 ? "categoría" : "categorías"}</span>
                          )}
                        </div>

                        {/* Last updated */}
                        {store.updatedAt && (
                          <div className="text-xs text-muted-foreground/60">
                            {getRelativeTime(store.updatedAt)}
                          </div>
                        )}
                      </div>

                      {/* CTA Button - Strong affordance */}
                      <div className="mt-2">
                        <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary font-semibold text-sm transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/25">
                          Ver catálogo
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              };

              // Separate stores by type
              const featuredStores = stores.filter((s: any) => s.isFeatured);
              const newStores = stores.filter((s: any) => s.isNew && !s.isFeatured);

              return (
                <div className="space-y-12">
                  {/* Featured Stores Section */}
                  {featuredStores.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" aria-hidden />
                        <h2 className="text-2xl font-bold">Tiendas Destacadas</h2>
                        <span className="text-sm text-muted-foreground">
                          {featuredStores.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-6 lg:grid-cols-3 xl:grid-cols-4">
                        {featuredStores.map((store: any) => renderStoreCard(store, true))}
                      </div>
                    </div>
                  )}

                  {/* New Stores Section */}
                  {newStores.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                        <h2 className="text-2xl font-bold">Nuevas Llegadas</h2>
                        <span className="text-sm text-muted-foreground">
                          {newStores.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-6 lg:grid-cols-3 xl:grid-cols-4">
                        {newStores.map((store: any) => renderStoreCard(store))}
                      </div>
                    </div>
                  )}

                  {/* All Stores Section - Always visible */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">Todas las Tiendas</h2>
                      <span className="text-sm text-muted-foreground">
                        {stores.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-6 lg:grid-cols-3 xl:grid-cols-4">
                      {stores.map((store: any) => renderStoreCard(store))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      currentPage > 1 && handlePageChange(currentPage - 1)
                    }
                    aria-disabled={currentPage === 1}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      currentPage < totalPages &&
                      handlePageChange(currentPage + 1)
                    }
                    aria-disabled={currentPage === totalPages}
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
    </section>
  );
};

export default LandingContent;
