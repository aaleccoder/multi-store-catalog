import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { prisma } from "@/lib/db";
import { StoreThemeProvider } from "@/components/theme/store-theme-provider";
import type { StoreTheme } from "@/lib/theme";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Admin - Una Ganga",
  description: "Catálogo para Lea",
};

import "../globals.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify session server-side
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login-admin");
  }

  const cookieStore = await cookies();
  const activeStoreId = cookieStore.get?.("activeStoreId")?.value;
  const activeStoreTheme = activeStoreId
    ? ((await prisma.store.findUnique({ where: { id: activeStoreId } }))
        ?.theme as StoreTheme | null)
    : null;

  return (
    <div className={`${outfit.className}`}>
      <StoreThemeProvider theme={activeStoreTheme ?? undefined}>
        {children}
        <Toaster />
      </StoreThemeProvider>
    </div>
  );
}
