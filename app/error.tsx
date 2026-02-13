"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const isDatabaseLikeError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  return (
    error.name === "DatabaseUnavailableError" ||
    message.includes("database_temporarily_unavailable") ||
    message.includes("can't reach database server")
  );
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const showDatabaseMessage = isDatabaseLikeError(error);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-10">
      <main className="w-full max-w-2xl border border-border bg-card p-8 space-y-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-1" />
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {showDatabaseMessage
                ? "Servicio temporalmente no disponible"
                : "Ocurrio un error inesperado"}
            </h1>
            <p className="text-muted-foreground">
              {showDatabaseMessage
                ? "Intenta nuevamente en unos segundos."
                : "No pudimos completar esta accion. Puedes reintentar ahora."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={reset}>
            <RefreshCcw className="h-4 w-4" />
            Reintentar
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Ir al inicio</Link>
          </Button>
        </div>

        {process.env.NODE_ENV !== "production" && (
          <div className="border border-border bg-background p-3 text-xs text-muted-foreground font-mono break-all">
            {error.message}
            {error.digest ? `\nDigest: ${error.digest}` : ""}
          </div>
        )}
      </main>
    </div>
  );
}
