"use client"

import AdminResource from '@/components/admin/admin-resource'
import { AdminNav } from '@/components/admin/admin-nav'

export default function SubcategoriesPage() {
    const loadDependencies = async () => {
        const res = await fetch('/api/categories')
        const json = await res.json()
        const docs = json.docs || []
        return { categoryId: docs.map((c: any) => ({ value: c.id, label: c.name })) }
    }

    return (
        <div className="min-h-screen bg-background">
            <AdminNav />

            <main className=" pt-20 lg:pt-0">
                <div className="p-8">
                    <AdminResource
                        title="Subcategorías"
                        fetchUrl="/api/admin/subcategories"
                        columns={[
                            { header: 'Nombre', accessor: 'name' },
                            { header: 'Slug', accessor: 'slug' },
                            { header: 'Categoría', render: (s: any) => s.category?.name || 'N/A' },
                            { header: 'Productos', render: (s: any) => s._count?.products || 0 },
                            { header: 'Estado', render: (s: any) => (s.isActive ? 'Activo' : 'Inactivo') },
                        ]}
                        formFields={[
                            { name: 'categoryId', label: 'Categoría', type: 'select', required: true },
                            { name: 'name', label: 'Nombre', type: 'text', required: true },
                            { name: 'slug', label: 'Slug', type: 'text', required: true },
                            { name: 'description', label: 'Descripción', type: 'textarea' },
                            { name: 'isActive', label: 'Activo', type: 'switch' },
                        ]}
                        loadDependencies={loadDependencies}
                        newButtonLabel="Agregar Subcategoría"
                        searchKeys={['name']}
                    />
                </div>
            </main>
        </div>
    )
}
