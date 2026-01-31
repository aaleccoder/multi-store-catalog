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

// Disable caching for all admin routes
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  return (
    <div className={`${outfit.className}`}>
      {children}
      <Toaster />
    </div>
  );
}
