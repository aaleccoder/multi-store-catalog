"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, Instagram, Facebook, Twitter } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-muted text-muted-foreground border-t">
            <div className="container mx-auto px-6 py-12">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/android-chrome-192x192.png"
                                alt="Logo de Catálogo Multi-Tienda"
                                width={48}
                                height={48}
                                className="rounded"
                            />
                            <div className="">
                                <p className="font-bold text-foreground">Una Ganga</p>
                                <p className="text-sm">Catálogos</p>
                            </div>
                        </div>
                        <p className="text-sm">
                            Tu plataforma única para crear y gestionar catálogos de múltiples tiendas.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <p className="font-semibold text-foreground">Enlaces rápidos</p>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/#stores" className="hover:text-foreground transition-colors">
                                    Tiendas
                                </Link>
                            </li>
                            <li>
                                <Link href="/info" className="hover:text-foreground transition-colors">
                                    Planes y precios
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-foreground transition-colors">
                                    Contacto
                                </Link>
                            </li>
                            <li>
                                <Link href="/login-admin" className="hover:text-foreground transition-colors">
                                    Iniciar sesión
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-4">
                        <p className="font-semibold text-foreground">Legal</p>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/terms" className="hover:text-foreground transition-colors">
                                    Términos de uso
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="hover:text-foreground transition-colors">
                                    Política de privacidad
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <p className="font-semibold text-foreground">Contacto</p>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a
                                    href="mailto:wavelikeonline111@gmail.com"
                                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                                >
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate">wavelikeonline111@gmail.com</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="tel:+5359365880"
                                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                                >
                                    <Phone className="h-4 w-4" />
                                    +53 5 936 5880
                                </a>
                            </li>
                            <li>
                                <a
                                    href="tel:+5355817532"
                                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                                >
                                    <Phone className="h-4 w-4" />
                                    +53 5 581 7532
                                </a>
                            </li>
                        </ul>

                        {/* Social Media */}
                        <div className="pt-2">
                            <p className="mb-2 text-xs font-semibold text-foreground">Síguenos</p>
                            <div className="flex gap-2">
                                <a
                                    href="https://instagram.com/wavelikeonline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-accent hover:text-foreground"
                                    aria-label="Instagram"
                                >
                                    <Instagram className="h-4 w-4" />
                                </a>
                                <a
                                    href="https://twitter.com/wavelikeonline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-accent hover:text-foreground"
                                    aria-label="Twitter"
                                >
                                    <Twitter className="h-4 w-4" />
                                </a>
                                <a
                                    href="https://facebook.com/wavelikeonline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border transition-colors hover:bg-accent hover:text-foreground"
                                    aria-label="Facebook"
                                >
                                    <Facebook className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 border-t pt-8">
                    <div className="flex flex-col items-center justify-between gap-4 text-sm md:flex-row">
                        <p>&copy; {new Date().getFullYear()} Una Ganga - Catálogos. Todos los derechos reservados.</p>
                        <p className="text-xs">Hecho con ❤️ para emprendedores</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
