import { AdminNav } from '@/components/admin/admin-nav'
import { prisma } from '@/lib/db'

export default async function AdminDashboard() {
    const totalProducts = await prisma.product.count()
    const categoriesCount = await prisma.category.count()
    const activeProductsCount = await prisma.product.count({ where: { isActive: true } })
    const totalCurrencies = await prisma.currency.count()
    return (
        <div className="min-h-screen bg-background">

            <main className="pt-20 lg:pt-0">
                <div className="p-8">
                    <h1 className="text-3xl font-bold mb-6">Panel de Control</h1>

                    <p className="text-sm text-muted-foreground mb-6">Una visión general de solo lectura de las métricas clave de la tienda. Haz clic en los enlaces de administración para gestionar recursos.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* Stats cards */}
                        <div className="bg-card p-6 rounded-lg border border-border">
                            <h3 className="text-sm font-medium text-muted-foreground">Productos Totales</h3>
                            <p className="text-3xl font-bold mt-2">{totalProducts}</p>
                        </div>

                        <div className="bg-card p-6 rounded-lg border border-border">
                            <h3 className="text-sm font-medium text-muted-foreground">Categorías</h3>
                            <p className="text-3xl font-bold mt-2">{categoriesCount}</p>
                        </div>

                        <div className="bg-card p-6 rounded-lg border border-border">
                            <h3 className="text-sm font-medium text-muted-foreground">Productos Activos</h3>
                            <p className="text-3xl font-bold mt-2">{activeProductsCount}</p>
                        </div>

                        {/* Currencies */}
                        <div className="bg-card p-6 rounded-lg border border-border">
                            <h3 className="text-sm font-medium text-muted-foreground">Monedas</h3>
                            <p className="text-3xl font-bold mt-2">{totalCurrencies}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
