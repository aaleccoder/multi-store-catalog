import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Eye } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface StorePageProps {
  params: Promise<{ slug: string }>;
}

export default async function StoreGroupPage({ params }: StorePageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login-admin");
  }

  const { slug } = await params;

  const store = await prisma.store.findFirst({
    where: { slug, ownerId: session.user.id },
  });

  if (!store) {
    notFound();
  }

  const [productCount, categoryCount, subcategoryCount, currencyCount] =
    await Promise.all([
      prisma.product.count({ where: { storeId: store.id } }),
      prisma.category.count({ where: { storeId: store.id } }),
      prisma.subcategory.count({ where: { storeId: store.id } }),
      prisma.storeCurrency.count({
        where: { storeId: store.id, isEnabled: true },
      }),
    ]);

  const basePath = `/admin/stores/${store.slug}`;

  const resourceCards = [
    {
      title: "Productos",
      description: "Gestiona el catalogo y variantes de esta tienda.",
      href: `${basePath}/products`,
      count: productCount,
    },
    {
      title: "Categorias",
      description: "Organiza las categorias principales.",
      href: `${basePath}/categories`,
      count: categoryCount,
    },
    {
      title: "Subcategorias",
      description: "Refina la jerarquia de productos.",
      href: `${basePath}/subcategories`,
      count: subcategoryCount,
    },
    {
      title: "Monedas",
      description: "Configura monedas y formatos de precio.",
      href: `${basePath}/currencies`,
      count: currencyCount,
    },
    {
      title: "Media",
      description: "Biblioteca de imagenes para productos.",
      href: `${basePath}/media`,
    },
    {
      title: "Tema",
      description: "Colores y tipografías de la tienda.",
      href: `${basePath}/theme`,
    },
    {
      title: "Identidad",
      description: "Logo, contacto y redes sociales.",
      href: `${basePath}/branding`,
    },
    {
      title: "Usuarios",
      description: "Administrar miembros con acceso.",
      href: `${basePath}/users`,
    },
    {
      title: "Configuracion",
      description: "Ajustes generales y datos fiscales.",
      href: `${basePath}/settings`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="md:pt-20 lg:pt-0">
        <div className="p-4 md:p-8 space-y-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 mt-18 md:mt-0">
              <p className="text-sm text-muted-foreground">/{store.slug}</p>
              <h1 className="text-3xl font-bold">{store.name}</h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                {store.description || "Sin descripcion"}
              </p>
              <div className="flex items-center gap-3">
                <Badge variant={store.isActive ? "default" : "secondary"}>
                  {store.isActive ? "Activa" : "Inactiva"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ID: {store.id}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link
                  href={`/store/${store.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Visitar tienda
                </Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
              <CardDescription>
                Recursos principales de la tienda seleccionada.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatTile label="Productos" value={productCount} />
                <StatTile label="Categorias" value={categoryCount} />
                <StatTile label="Subcategorias" value={subcategoryCount} />
                <StatTile label="Monedas" value={currencyCount} />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gestion rapida</h2>
              <span className="text-sm text-muted-foreground">
                Todo dentro de esta tienda
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resourceCards.map((resource) => (
                <Card key={resource.title} className="h-full border-border/70">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg">
                          {resource.title}
                        </CardTitle>
                        <CardDescription>
                          {resource.description}
                        </CardDescription>
                      </div>
                      {typeof resource.count === "number" && (
                        <Badge variant="outline">{resource.count}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      <Separator />
                      <Button asChild>
                        <Link href={resource.href}>Abrir</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border/70 bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
