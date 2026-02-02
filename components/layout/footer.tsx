"use client";

import Link from "next/link";
import Logo from "./logo";
import { Facebook, Instagram, Twitter, MapPin } from "lucide-react";
import { useStoreBranding } from "@/components/theme/store-theme-provider";

export function Footer() {
  const branding = useStoreBranding();



  return (
    <footer className="bg-primary/30 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="">
            <div className="flex items-center">
              <Logo className="h-24 w-24" />
            </div>
            <p className="text-sm text-muted-foreground">
              El placer de probar algo diferente
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Dirección</h3>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <address className="not-italic">
                {branding.contactAddress || "Calle 94 y 5ta Avenida, Miramar, La Habana"}
              </address>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Contacto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {branding.contactEmail && (
                <li className="hover:text-primary transition-colors">
                  <a href={`mailto:${branding.contactEmail}`}>Email: {branding.contactEmail}</a>
                </li>
              )}
              {branding.contactPhone && (
                <li className="hover:text-primary transition-colors">
                  <a href={`tel:${branding.contactPhone}`}>Tel: {branding.contactPhone}</a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Síguenos</h3>
            <div className="flex gap-4">
              {branding.socialFacebook && (
                <Link
                  href={branding.socialFacebook}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="h-5 w-5" />
                </Link>
              )}
              {branding.socialInstagram && (
                <Link
                  href={branding.socialInstagram}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-5 w-5" />
                </Link>
              )}
              {branding.socialTwitter && (
                <Link
                  href={branding.socialTwitter}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Una Ganga. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
