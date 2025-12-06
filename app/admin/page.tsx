import Link from 'next/link'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { Button } from '@/components/ui/button'
import { StoreSelectionClient } from './store-selection-client'

export default async function AdminDashboard() {
    const session = await getSession()
    const userId = session?.user?.id

    const stores = userId
        ? await prisma.store.findMany({ where: { ownerId: userId }, orderBy: { createdAt: 'asc' } })
        : []

    const cookieStore = cookies()
    const activeStoreId = (await cookieStore).get('activeStoreId')?.value
    const activeStore = stores.find((s) => s.id === activeStoreId) ?? stores[0]

    const stats = activeStore
        ? await Promise.all([
            prisma.product.count({ where: { storeId: activeStore.id } }),
            prisma.category.count({ where: { storeId: activeStore.id } }),
            prisma.product.count({ where: { storeId: activeStore.id, isActive: true } }),
            prisma.currency.count({ where: { storeId: activeStore.id } }),
        ])
        : null

    const [totalProducts = 0, categoriesCount = 0, activeProductsCount = 0, totalCurrencies = 0] = stats || []

    return (
        <div className="min-h-screen bg-background">

            <main className="md:pt-20 lg:pt-0">
                <div className="p-4 md:p-8 space-y-10">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Selecciona tu tienda</h1>
                            <p className="text-sm text-muted-foreground">
                                Elige una tienda para habilitar el panel lateral y gestionar tus recursos.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="default">
                                <Link href="/admin/stores">Crear o administrar tiendas</Link>
                            </Button>
                        </div>
                    </div>

                    {stores.length === 0 ? (
                        <div className="border border-dashed border-border rounded-lg p-8 bg-card">
                            <p className="text-lg font-semibold mb-2">Aún no tienes tiendas</p>
                            <p className="text-sm text-muted-foreground mb-4">
                                Crea una tienda para gestionar tus productos, categorías y configuración.
                            </p>
                            <Button asChild>
                                <Link href="/admin/stores">Crear tienda</Link>
                            </Button>
                        </div>
                    ) : (
                        <StoreSelectionClient stores={stores} />
                    )}

                    {activeStore && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Resumen de {activeStore.name}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Link href="/admin/products" className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-shadow block">
                                    <h3 className="text-sm font-medium text-muted-foreground">Productos</h3>
                                    <p className="text-3xl font-bold mt-2">{totalProducts}</p>
                                </Link>

                                <Link href="/admin/categories" className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-shadow block">
                                    <h3 className="text-sm font-medium text-muted-foreground">Categorías</h3>
                                    <p className="text-3xl font-bold mt-2">{categoriesCount}</p>
                                </Link>

                                <Link href="/admin/products" className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-shadow block">
                                    <h3 className="text-sm font-medium text-muted-foreground">Productos activos</h3>
                                    <p className="text-3xl font-bold mt-2">{activeProductsCount}</p>
                                </Link>

                                <Link href="/admin/currencies" className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-shadow block">
                                    <h3 className="text-sm font-medium text-muted-foreground">Monedas</h3>
                                    <p className="text-3xl font-bold mt-2">{totalCurrencies}</p>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
