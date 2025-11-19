import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/session'
import { Role } from '@/generated/prisma/enums'

export default async function AdminDashboard() {
    const session = await getSession()
    const isAdmin = session?.user?.role === Role.ADMIN

    const totalProducts = await prisma.product.count()
    const categoriesCount = await prisma.category.count()
    const activeProductsCount = await prisma.product.count({ where: { isActive: true } })
    const totalCurrencies = await prisma.currency.count()
    const totalUsers = isAdmin ? await prisma.user.count() : 0

    return (
        <div className="min-h-screen bg-background">

            <main className="md:pt-20 lg:pt-0">
                <div className="p-4 md:p-8">
                    <h1 className="text-3xl font-bold mb-6">Panel de Control</h1>

                    <p className="text-sm text-muted-foreground mb-6">Bienvenida!</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Link href="/admin/products" className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-shadow block">
                            <h3 className="text-sm font-medium text-muted-foreground">Productos Totales</h3>
                            <p className="text-3xl font-bold mt-2">{totalProducts}</p>
                        </Link>

                        <Link href="/admin/categories" className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-shadow block">
                            <h3 className="text-sm font-medium text-muted-foreground">Categorías</h3>
                            <p className="text-3xl font-bold mt-2">{categoriesCount}</p>
                        </Link>

                        <Link href="/admin/products" className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-shadow block">
                            <h3 className="text-sm font-medium text-muted-foreground">Productos Activos</h3>
                            <p className="text-3xl font-bold mt-2">{activeProductsCount}</p>
                        </Link>

                        {/* Currencies */}
                        <Link href="/admin/currencies" className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-shadow block">
                            <h3 className="text-sm font-medium text-muted-foreground">Monedas</h3>
                            <p className="text-3xl font-bold mt-2">{totalCurrencies}</p>
                        </Link>

                        {isAdmin && (
                            <Link href="/admin/users" className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-shadow block">
                                <h3 className="text-sm font-medium text-muted-foreground">Usuarios</h3>
                                <p className="text-3xl font-bold mt-2">{totalUsers}</p>
                            </Link>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
