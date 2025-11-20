'use client'

import { useState, useEffect } from 'react'
import AdminResource from '@/components/admin/admin-resource'
import { IconPicker, IconName } from '@/components/ui/icon-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { generateSlug, sanitizeSlugInput } from '@/lib/utils'

interface CategoryFormProps {
    formData: any
    setFormData: (data: any) => void
}

function CategoryForm({ formData, setFormData }: CategoryFormProps) {
    const [manuallyEditedSlug, setManuallyEditedSlug] = useState(false)

    // Reset manual edit state when the form is opened for a new/different item
    // We use the ID to detect if we switched items. If ID is missing, it's a new item.
    useEffect(() => {
        if (formData.slug && formData.name) {
            const generated = generateSlug(formData.name)
            if (formData.slug !== generated) {
                setManuallyEditedSlug(true)
            } else {
                setManuallyEditedSlug(false)
            }
        } else {
            setManuallyEditedSlug(false)
        }
        // We only want to run this when the item *initially* loads, not on every keystroke.
        // However, formData changes on every keystroke.
        // Ideally AdminResource would mount a fresh component instance.
        // If not, we might need a ref to track the "current" ID.
        // For now, assuming AdminResource unmounts/remounts or we can rely on initial mount if we key it.
    }, [])

    // Actually, if AdminResource reuses the component, the empty dependency array [] won't re-run.
    // We should probably key the component in the renderForm prop if possible, or watch ID.
    // But renderForm doesn't accept a key.
    // Let's watch formData.id.
    useEffect(() => {
        if (formData.id) {
            const generated = generateSlug(formData.name || '')
            if (formData.slug !== generated) {
                setManuallyEditedSlug(true)
            } else {
                setManuallyEditedSlug(false)
            }
        } else {
            // New item
            setManuallyEditedSlug(false)
        }
    }, [formData.id]) // Only re-run when ID changes (switching items)


    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                    id="name"
                    value={String(formData.name ?? '')}
                    onChange={(e) => {
                        const name = e.target.value
                        setFormData({
                            ...formData,
                            name,
                            slug: manuallyEditedSlug ? formData.slug : generateSlug(name),
                        })
                    }}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                    id="slug"
                    value={String(formData.slug ?? '')}
                    onChange={(e) => {
                        const value = e.target.value
                        if (value === '') {
                            setManuallyEditedSlug(false)
                            setFormData({ ...formData, slug: generateSlug(formData.name || '') })
                        } else {
                            setManuallyEditedSlug(true)
                            setFormData({ ...formData, slug: sanitizeSlugInput(value) })
                        }
                    }}
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
    )
}

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
                            <CategoryForm formData={formData} setFormData={setFormData} />
                        )}
                        searchKeys={['name', 'slug']}
                        newButtonLabel="Agregar Categoría"
                    />
                </div>
            </main>
        </div>
    )
}
