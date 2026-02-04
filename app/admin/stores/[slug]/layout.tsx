import { ReactNode } from "react";
import { cookies, headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminNav } from "@/components/admin/admin-nav";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ActiveStoreClient } from "../active-store-client";
import { StoreThemeProvider } from "@/components/theme/store-theme-provider";
import { StoreTheme } from "@/lib/theme";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface StoreLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function StoreLayout({
  children,
  params,
}: StoreLayoutProps) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login-admin");
  }

  const store = await prisma.store.findFirst({
    where: { slug: slug, ownerId: session.user.id },
  });

  if (!store) {
    notFound();
  }

  const cookieStore = await cookies();
  const currentActiveStoreId = cookieStore.get("activeStoreId")?.value;



  return (
    <>
      <SidebarProvider>
        <AdminNav />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
      <ActiveStoreClient
        key={store.id}
        storeId={store.id}
        currentActiveStoreId={currentActiveStoreId}
      />
    </>
  );
}
