"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  DollarSign,
  FolderTree,
  LogOut,
  ImageIcon,
  Users,
  Settings,
  Palette,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import LogoProps from "../layout/logo";
import { authClient } from "@/lib/auth-client";
import { Role } from "@/generated/prisma/enums";
import { trpc } from "@/trpc/client";
import { LogoutDialog } from "@/components/ui/logout-dialog";
import Image from "next/image";
import { storeSchemaClient } from "@/lib/types";

export function AdminNav() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const segments = pathname.split("/").filter(Boolean);
  const storeSlug =
    segments[0] === "admin" && segments[1] === "stores" ? segments[2] : null;
  const storeBase = storeSlug ? `/admin/stores/${storeSlug}` : "/admin/stores";

  const { data: store } = trpc.admin.stores.getBySlug.useQuery(
    storeSlug || "",
    {
      enabled: !!storeSlug,
    },
  );

  const storeParsed = storeSchemaClient.safeParse(store);
  const storeData = storeParsed.success ? storeParsed.data : undefined;

  const navigation = [
    {
      name: "Panel de Control",
      href: storeSlug ? storeBase : "/admin/stores",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Productos",
      href: storeSlug ? `${storeBase}/products` : "/admin/stores",
      icon: Package,
    },
    {
      name: "Categorías",
      href: storeSlug ? `${storeBase}/categories` : "/admin/stores",
      icon: FolderTree,
    },
    {
      name: "Subcategorías",
      href: storeSlug ? `${storeBase}/subcategories` : "/admin/stores",
      icon: FolderTree,
    },
    {
      name: "Media",
      href: storeSlug ? `${storeBase}/media` : "/admin/stores",
      icon: ImageIcon,
    },
    {
      name: "Monedas",
      href: storeSlug ? `${storeBase}/currencies` : "/admin/stores",
      icon: DollarSign,
    },
    {
      name: "Tema",
      href: storeSlug ? `${storeBase}/theme` : "/admin/stores",
      icon: Palette,
    },
    {
      name: "Configuración",
      href: storeSlug ? `${storeBase}/branding` : "/admin/stores",
      icon: ImageIcon,
    },
  ];

  const adminNavigation = [
    {
      name: "Users",
      href: storeSlug ? `${storeBase}/users` : "/admin/stores",
      icon: Users,
    },
    {
      name: "Configuración",
      href: storeSlug ? `${storeBase}/settings` : "/admin/stores",
      icon: Settings,
    },
  ];

  const handleLogout = async () => {
    await authClient.signOut();
    setIsDialogOpen(false);
    router.push("/login-admin");
  };

  const isActivePath = (href: string, exact?: boolean) => {
    const cleanHref = href.split("?")[0];
    if (exact) return pathname === cleanHref;
    return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
  };

  return (
    <>
      {/* Mobile header: we keep a small top bar with a trigger for mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-border p-4">
        <div className="flex items-center">
          <SidebarTrigger />
          <p className="text-xl font-bold px-4">Panel de Tiendas</p>
        </div>
      </div>

      <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
        <SidebarHeader className="">
          <button
            onClick={() => router.push(storeSlug ? `/admin/stores/${storeSlug}` : "/admin/stores")}
            className="shrink-0 cursor-pointer flex flex-row items-center"
            aria-label="Ir a inicio"
          >
            <div className="relative">
              {storeData?.theme?.branding?.logoUrl ? (
                <Image
                  src={storeData?.theme?.branding?.logoUrl}
                  alt={storeData?.theme?.branding?.logoAlt || "Logo"}
                  className="object-cover p-1"
                  width={92}
                  height={92}
                />
              ) : (
                <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">No logo</span>
                </div>
              )}
            </div>
            {store && (
              <div className="flex flex-row text-xl font-bold text-foreground px-4 items-center">
                <p>{store.name}</p>
              </div>
            )}
          </button>
          <Link href="/admin/stores" className="cursor-pointer justify-start flex flex-row items-center px-4 py-2 hover:bg-primary rounded-md">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span >Ir a tiendas</span>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-4">
          <SidebarMenu>
            {navigation.map((item) => {
              const isActive = isActivePath(item.href, item.exact);
              return (
                <SidebarMenuItem key={item.name} className="">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className="h-12 text-xl"
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 w-full"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
            {session?.user?.role === Role.ADMIN &&
              adminNavigation.map((item) => {
                const isActive = isActivePath(item.href);

                return (
                  <SidebarMenuItem key={item.name} className="">
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="h-12 text-xl"
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 w-full"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => setIsDialogOpen(true)}
          >
            <LogOut className="h-5 w-5" />
            <span>Cerrar Sesión</span>
          </Button>
        </SidebarFooter>
      </Sidebar >
      <LogoutDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleLogout}
      />
    </>
  );
}
