"use client"

import AdminResource from '@/components/admin/admin-resource'
import { AdminNav } from '@/components/admin/admin-nav'

export default function CategoriesPage() {
    return (
        <div className="min-h-screen bg-background">

            <main className=" pt-20 lg:pt-0">
                <div className="p-8">
                    <AdminResource
                        title="Categories"
                        fetchUrl="/api/admin/categories"
                        columns={[
                            { header: 'Name', accessor: 'name' },
                            { header: 'Slug', accessor: 'slug', className: 'text-muted-foreground' },
                            { header: 'Products', render: (x: any) => x._count?.products || 0 },
                            { header: 'Status', render: (x: any) => (x.isActive ? 'Active' : 'Inactive') },
                        ]}
                        formFields={[
                            { name: 'name', label: 'Name', type: 'text', required: true },
                            { name: 'slug', label: 'Slug', type: 'text', required: true },
                            { name: 'description', label: 'Description', type: 'textarea' },
                            { name: 'isActive', label: 'Active', type: 'switch' },
                        ]}
                        searchKeys={['name', 'slug']}
                        newButtonLabel="Add Category"
                    />
                </div>
            </main>
        </div>
    )
}
