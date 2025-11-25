import Link from 'next/link'
import Logo from './logo'
import { Facebook, Instagram, Twitter, MapPin } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-primary/30 border-t border-border mt-auto">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="">
                        <div className="flex items-center">
                            <Logo className="h-24 w-24" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Catálogo de productos de alta calidad.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">Dirección</h3>
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                            <address className="not-italic">
                                Calle Principal #123<br />
                                Santo Domingo, República Dominicana<br />
                                CP 10000
                            </address>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">Contacto</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>Email: info@wapa.com</li>
                            <li>Tel: +1 (809) 123-4567</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">Síguenos</h3>
                        <div className="flex gap-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Facebook className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Wapa Catalog. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    )
}
