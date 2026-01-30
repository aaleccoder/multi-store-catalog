"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { defaultStoreBranding } from "@/lib/theme";
import Antigravity from "./Antigravity";

const LandingContent = ({ stores }) => {
  return (
    <>
      <section className="relative w-full h-full bg-white">
        <div className="absolute inset-0">
          <Antigravity />
        </div>
        <div className="absolute inset-0 bg-linear-to-b from-primary to-white z-5"></div>
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 pt-24 pb-16 lg:pt-28 lg:pb-20 relative z-10 pointer-events-none">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Catálogo multi-tienda
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Un landing sobrio para descubrir todas tus tiendas en un solo
              lugar.
            </h1>
            <p className="max-w-3xl text-lg text-muted-foreground">
              Cataloglea reúne tus catálogos en una experiencia limpia y
              enfocada. Los clientes pueden explorar cada tienda sin
              distracciones, y tú mantienes la gestión centralizada.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="pointer-events-auto">
                <Link href="#stores">Explorar tiendas activas</Link>
              </Button>
              <Button asChild variant="outline" className="pointer-events-auto">
                <Link href="/login-admin">Ir al panel de administración</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Gestión de catálogos centralizada",
              "Temas personalizables por tienda",
              "Compras fluidas con carrito y wishlist",
            ].map((item) => (
              <div
                key={item}
                className="rounded-lg bg-background/70 px-4 py-3 text-sm text-muted-foreground"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="stores"
        className="mx-auto max-w-5xl px-6 py-12 lg:py-16 bg-white"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Tiendas disponibles</p>
            <h2 className="text-2xl font-semibold">
              Explora las marcas activas
            </h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {stores.length} tienda(s) activas
          </span>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stores.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed border-border/70 bg-card/60 px-6 py-10 text-center text-sm text-muted-foreground">
              Aún no hay tiendas activas. Crea la primera desde el panel de
              administración.
            </div>
          )}

          {stores.map((store) => {
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
                className="group relative flex flex-col rounded-lg border border-border/70 bg-card p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-md border border-border/70 bg-background">
                    <Image
                      src={logoSrc}
                      alt={logoAlt}
                      width={56}
                      height={56}
                      className="h-12 w-12 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold leading-tight">
                      {store.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      /{store.slug}
                    </p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">
                  {store.description || "Sin descripción por ahora."}
                </p>
                <span className="mt-5 inline-flex items-center text-sm font-medium text-foreground">
                  Visitar tienda{" "}
                  <span
                    aria-hidden
                    className="ml-2 transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default LandingContent;
