import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { mergeTheme, defaultStoreBranding, type StoreTheme } from '@/lib/theme'
import { Button } from '@/components/ui/button'

export default async function LandingPage() {
    const stores = await prisma.store.findMany({
        where: { isActive: true },
        select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            theme: true,
        },
        orderBy: { createdAt: 'asc' },
    })

    const storesWithBranding = stores.map((store) => {
        const merged = mergeTheme((store.theme ?? undefined) as StoreTheme | undefined)
        const branding = merged.branding ?? defaultStoreBranding

        return {
            ...store,
            branding,
        }
    })

    return (
        <div className="min-h-screen bg-background text-foreground">
            <section className="border-b border-border/70 bg-card/60">
                <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-16 lg:py-20">
                    <div className="space-y-4">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Catálogo multi-tienda</p>
                        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                            Un landing sobrio para descubrir todas tus tiendas en un solo lugar.
                        </h1>
                        <p className="max-w-3xl text-lg text-muted-foreground">
                            Cataloglea reúne tus catálogos en una experiencia limpia y enfocada. Los clientes pueden explorar cada
                            tienda sin distracciones, y tú mantienes la gestión centralizada.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild>
                                <Link href="#stores">Explorar tiendas activas</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/login-admin">Ir al panel de administración</Link>
                            </Button>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            'Gestión de catálogos centralizada',
                            'Temas personalizables por tienda',
                            'Compras fluidas con carrito y wishlist',
                        ].map((item) => (
                            <div key={item} className="rounded-lg border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="stores" className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Tiendas disponibles</p>
                        <h2 className="text-2xl font-semibold">Explora las marcas activas</h2>
                    </div>
                    <span className="text-sm text-muted-foreground">{storesWithBranding.length} tienda(s) activas</span>
                </div>

                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {storesWithBranding.length === 0 && (
                        <div className="col-span-full rounded-lg border border-dashed border-border/70 bg-card/60 px-6 py-10 text-center text-sm text-muted-foreground">
                            Aún no hay tiendas activas. Crea la primera desde el panel de administración.
                        </div>
                    )}

                    {storesWithBranding.map((store) => {
                        const logoSrc = store.branding.logoUrl ?? defaultStoreBranding.logoUrl ?? '/android-chrome-192x192.png'
                        const logoAlt = store.branding.logoAlt ?? defaultStoreBranding.logoAlt ?? `${store.name} logo`

                        return (
                            <Link
                                key={store.id}
                                href={`/store/${store.slug}`}
                                className="group relative flex flex-col rounded-lg border border-border/70 bg-card p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-md"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-md border border-border/70 bg-background">
                                        <Image
                                            src={logoSrc}
                                            alt={logoAlt}
                                            width={56}
                                            height={56}
                                            className="h-12 w-12 object-contain"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold leading-tight">{store.name}</h3>
                                        <p className="text-sm text-muted-foreground">/{store.slug}</p>
                                    </div>
                                </div>
                                <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">
                                    {store.description || 'Sin descripción por ahora.'}
                                </p>
                                <span className="mt-5 inline-flex items-center text-sm font-medium text-foreground">
                                    Ver tienda <span aria-hidden className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </section>
        </div>
    )
}
