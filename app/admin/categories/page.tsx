"use client"

import AdminResource from '@/components/admin/admin-resource'
import { AdminNav } from '@/components/admin/admin-nav'

export default function CategoriesPage() {
    return (
        <div className="min-h-screen bg-background">

            <main className=" pt-20 lg:pt-0">
                <div className="p-8">
                    <AdminResource
                        title="Categorías"
                        fetchUrl="/api/admin/categories"
                        columns={[
                            { header: 'Nombre', accessor: 'name' },
                            { header: 'Slug', accessor: 'slug', className: 'text-muted-foreground' },
                            { header: 'Productos', render: (x: any) => x._count?.products || 0 },
                            { header: 'Estado', render: (x: any) => (x.isActive ? 'Activo' : 'Inactivo') },
                        ]}
                        formFields={[
                            { name: 'name', label: 'Nombre', type: 'text', required: true },
                            { name: 'slug', label: 'Slug', type: 'text', required: true },
                            { name: 'description', label: 'Descripción', type: 'textarea' },
                            { name: 'isActive', label: 'Activo', type: 'switch' },
                        ]}
                        searchKeys={['name', 'slug']}
                        newButtonLabel="Agregar Categoría"
                    />
                </div>
            </main>
        </div>
    )
}
