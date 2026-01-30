import React from "react";
import { Toaster } from "@/components/ui/sonner";

import "@/app/globals.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
      <Toaster />
    </div>
  );
}
