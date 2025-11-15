import { AdminNav } from '@/components/admin/AdminNav'

export default function AdminDashboard() {
    // Session is already validated in the layout
    return (
        <div className="min-h-screen bg-background">
            <AdminNav />

            <main className="lg:pl-64 pt-20 lg:pt-0">
                <div className="p-8">
                    <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Stats cards */}
                        <div className="bg-card p-6 rounded-lg border border-border">
                            <h3 className="text-sm font-medium text-muted-foreground">Total Products</h3>
                            <p className="text-3xl font-bold mt-2">0</p>
                        </div>

                        <div className="bg-card p-6 rounded-lg border border-border">
                            <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
                            <p className="text-3xl font-bold mt-2">0</p>
                        </div>

                        <div className="bg-card p-6 rounded-lg border border-border">
                            <h3 className="text-sm font-medium text-muted-foreground">Media Files</h3>
                            <p className="text-3xl font-bold mt-2">0</p>
                        </div>

                        <div className="bg-card p-6 rounded-lg border border-border">
                            <h3 className="text-sm font-medium text-muted-foreground">Active Products</h3>
                            <p className="text-3xl font-bold mt-2">0</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
