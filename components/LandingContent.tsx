"use client";

import Image from "next/image";
import Link from "next/link";
import { defaultStoreBranding } from "@/lib/theme";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
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

interface LandingContentProps {
  stores: any[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  searchQuery: string;
}

const LandingContent = ({
  stores,
  currentPage,
  totalPages,
  totalCount,
  searchQuery,
}: LandingContentProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchQuery);

  const handleSearch = (value: string) => {
    setSearch(value);
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      params.delete("page"); // Reset to page 1 on new search
      router.push(`/?${params.toString()}`);
    });
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
      <div className="space-y-6">
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

        {/* Welcome Message */}
        <div className="rounded-lg border border-primary/20 bg-linear-to-r from-primary/5 to-secondary/5 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1">¿Tienes un negocio?</h2>
              <p className="text-sm text-muted-foreground">
                Crea tu propio catálogo digital y llega a más clientes
              </p>
            </div>
            <Button asChild variant="default" className="shrink-0">
              <Link href="/info">Crear mi catálogo</Link>
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar tiendas..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading state overlay */}
        {isPending && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="text-muted-foreground">Cargando...</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {stores.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed border-border/70 bg-card/60 px-6 py-10 text-center text-sm text-muted-foreground">
              {searchQuery
                ? `No se encontraron tiendas que coincidan con "${searchQuery}".`
                : "Aún no hay tiendas activas. Crea la primera desde el panel de administración."}
            </div>
          )}

          {stores.map((store: any) => {
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
                className="group relative flex flex-col overflow-hidden border border-border bg-card transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
              >
                <div className="flex h-40 items-center justify-center bg-linear-to-br from-primary/5 to-secondary/5 px-4 py-4">
                  <Image
                    src={logoSrc}
                    alt={logoAlt}
                    width={96}
                    height={96}
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-col px-6 py-3 h-full">
                  <p className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
                    {store.name}
                  </p>
                  {store.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {store.description}
                    </p>
                  )}
                  <div className="flex items-center text-sm font-medium text-primary mt-auto">
                    Ver catálogo
                    <span
                      aria-hidden
                      className="ml-2 transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

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
