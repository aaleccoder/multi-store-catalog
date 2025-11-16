import { AdminNav } from '@/components/admin/AdminNav'
import { prisma } from '@/lib/db'

export default async function AdminDashboard() {
    const totalProducts = await prisma.product.count()
    const categoriesCount = await prisma.category.count()
    const mediaCount = await prisma.media.count()
    const activeProductsCount = await prisma.product.count({ where: { isActive: true } })
    const totalCurrencies = await prisma.currency.count()
    // For server-side counts use prisma
    // Note: This function is a Server Component; we can query prisma directly
    // but keep the existing layout simple — we'll fetch currencies count later
    // Session is already validated in the layout
    return (
        <div className="min-h-screen bg-background">
            <AdminNav />

            <main className="lg:pl-64 pt-20 lg:pt-0">
                <div className="p-8">
                    <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* Stats cards */}
                        <div className="bg-card p-6 rounded-lg border border-border">
                            <h3 className="text-sm font-medium text-muted-foreground">Total Products</h3>
                            <p className="text-3xl font-bold mt-2">{totalProducts}</p>
                        </div>

                        <div className="bg-card p-6 rounded-lg border border-border">
                            <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
                            <p className="text-3xl font-bold mt-2">{categoriesCount}</p>
                        </div>

                        <div className="bg-card p-6 rounded-lg border border-border">
                            <h3 className="text-sm font-medium text-muted-foreground">Media Files</h3>
                            <p className="text-3xl font-bold mt-2">{mediaCount}</p>
                        </div>

                        <div className="bg-card p-6 rounded-lg border border-border">
                            <h3 className="text-sm font-medium text-muted-foreground">Active Products</h3>
                            <p className="text-3xl font-bold mt-2">{activeProductsCount}</p>
                        </div>

                        {/* Currencies */}
                        <div className="bg-card p-6 rounded-lg border border-border">
                            <h3 className="text-sm font-medium text-muted-foreground">Currencies</h3>
                            <p className="text-3xl font-bold mt-2">{totalCurrencies}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
