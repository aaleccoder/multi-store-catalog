import Link from 'next/link'
import Logo from './logo'
import { Facebook, Instagram, Twitter } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-card border-t border-border mt-auto">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Logo className="h-10 w-10" />
                            <span className="text-xl font-bold text-primary">Wapa</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Catálogo de productos de alta calidad.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">Enlaces</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/" className="hover:text-primary transition-colors">Inicio</Link></li>
                            {/* <li><Link href="/products" className="hover:text-primary transition-colors">Productos</Link></li> */}
                            {/* <li><Link href="/about" className="hover:text-primary transition-colors">Nosotros</Link></li> */}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">Contacto</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>Email: info@wapa.com</li>
                            {/* <li>Tel: +123 456 7890</li> */}
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
