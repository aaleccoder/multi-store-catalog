"use client"

import AdminResource from '@/components/admin/AdminResource'
import { AdminNav } from '@/components/admin/AdminNav'

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

            <main className="lg:pl-64 pt-20 lg:pt-0">
                <div className="p-8">
                    <AdminResource
                        title="Subcategories"
                        fetchUrl="/api/admin/subcategories"
                        columns={[
                            { header: 'Name', accessor: 'name' },
                            { header: 'Slug', accessor: 'slug' },
                            { header: 'Category', render: (s: any) => s.category?.name || 'N/A' },
                            { header: 'Products', render: (s: any) => s._count?.products || 0 },
                            { header: 'Status', render: (s: any) => (s.isActive ? 'Active' : 'Inactive') },
                        ]}
                        formFields={[
                            { name: 'categoryId', label: 'Category', type: 'select', required: true },
                            { name: 'name', label: 'Name', type: 'text', required: true },
                            { name: 'slug', label: 'Slug', type: 'text', required: true },
                            { name: 'description', label: 'Description', type: 'textarea' },
                            { name: 'isActive', label: 'Active', type: 'switch' },
                        ]}
                        loadDependencies={loadDependencies}
                        newButtonLabel="Add Subcategory"
                        searchKeys={['name']}
                    />
                </div>
            </main>
        </div>
    )
}
