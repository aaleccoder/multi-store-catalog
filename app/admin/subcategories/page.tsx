"use client"

import { useCallback } from 'react'
import AdminResource from '@/components/admin/admin-resource'
import { trpc } from '@/trpc/client'

type CategoryList = { id: string; name: string }

export default function SubcategoriesPage() {
    const catsQuery = trpc.admin.categories.list.useQuery()

    const loadDependencies = useCallback(async () => {
        if (catsQuery.isLoading) await catsQuery.refetch()

        const cats = (catsQuery.data ?? []) as CategoryList[]

        const mapOptions = (list: CategoryList[]) => list.map((c) => ({ value: c.id, label: c.name, id: c.id }))

        return {
            categoryId: mapOptions(cats),
        }
    }, [catsQuery])

    return (
        <div className="min-h-screen bg-background">

            <main className="md:pt-20 lg:pt-0">
                <div className="">
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
