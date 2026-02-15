"use client";

import Link from "next/link";
import Logo from "./logo";
import { Facebook, Instagram, Twitter, MapPin } from "lucide-react";
import { useStoreBranding } from "@/components/theme/store-theme-provider";

export function Footer() {
  const branding = useStoreBranding();
  const contactAddress = branding.contactAddress?.trim();
  const contactEmail = branding.contactEmail?.trim();
  const contactPhone = branding.contactPhone?.trim();
  const socialFacebook = branding.socialFacebook?.trim();
  const socialInstagram = branding.socialInstagram?.trim();
  const socialTwitter = branding.socialTwitter?.trim();

  const hasAddress = Boolean(contactAddress);
  const hasContact = Boolean(contactEmail || contactPhone);
  const hasSocial = Boolean(
    socialFacebook ||
      socialInstagram ||
      socialTwitter
  );



  return (
    <footer className="bg-primary/30 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="">
            <div className="flex items-center">
              <Logo className="" />
            </div>
            {branding.slogan && (
              <p className="text-sm text-muted-foreground">
                {branding.slogan}
              </p>
            )}
          </div>

          {hasAddress && (
            <div>
              <p className="font-semibold mb-4 text-foreground">Dirección</p>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <Link
                  href={`https://www.google.com/maps?q=${encodeURIComponent(contactAddress ?? "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  <address className="not-italic">{contactAddress}</address>
                </Link>
              </div>
            </div>
          )}

          {hasContact && (
            <div>
              <p className="font-semibold mb-4 text-foreground">Contacto</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {contactEmail && (
                  <li className="hover:text-primary transition-colors">
                    <Link href={`mailto:${contactEmail}`}>Email: {contactEmail}</Link>
                  </li>
                )}
                {contactPhone && (
                  <li className="hover:text-primary transition-colors">
                    <Link href={`tel:${contactPhone}`}>Tel: {contactPhone}</Link>
                  </li>
                )}
              </ul>
            </div>
          )}

          {hasSocial && (
            <div>
              <p className="font-semibold mb-4 text-foreground">Síguenos</p>
              <div className="flex gap-4">
                {socialFacebook && (
                  <Link
                    href={socialFacebook}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Facebook className="h-5 w-5" />
                  </Link>
                )}
                {socialInstagram && (
                  <Link
                    href={socialInstagram}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="h-5 w-5" />
                  </Link>
                )}
                {socialTwitter && (
                  <Link
                    href={socialTwitter}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="h-5 w-5" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Construido con el servicio de catálogos <a href={process.env.NEXT_PUBLIC_APP_URL}>Una Ganga</a>. Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}
