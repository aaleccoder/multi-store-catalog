"use client"

import AdminResource from '@/components/admin/admin-resource'
import { IconPicker, IconName } from '@/components/ui/icon-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function CategoriesPage() {
    return (
        <div className="min-h-screen bg-background">

            <main className="md:pt-20 lg:pt-0">
                <div className="">
                    <AdminResource
                        title="Categorías"
                        fetchUrl="/api/admin/categories"
                        columns={[
                            { header: 'Nombre', accessor: 'name' },
                            { header: 'Slug', accessor: 'slug', className: 'text-muted-foreground' },
                            { header: 'Productos', render: (x: any) => x._count?.products || 0 },
                            { header: 'Estado', render: (x: any) => (x.isActive ? 'Activo' : 'Inactivo') },
                        ]}
                        renderForm={({ formData, setFormData }) => (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input
                                        id="name"
                                        value={String(formData.name ?? '')}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={String(formData.slug ?? '')}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción</Label>
                                    <textarea
                                        id="description"
                                        value={String(formData.description ?? '')}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full border rounded p-2"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Icono</Label>
                                    <IconPicker
                                        value={formData.icon as IconName | undefined}
                                        onValueChange={(icon) => setFormData({ ...formData, icon })}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isActive"
                                        checked={!!formData.isActive}
                                        onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
                                    />
                                    <Label htmlFor="isActive">Activo</Label>
                                </div>
                            </>
                        )}
                        searchKeys={['name', 'slug']}
                        newButtonLabel="Agregar Categoría"
                    />
                </div>
            </main>
        </div>
    )
}
