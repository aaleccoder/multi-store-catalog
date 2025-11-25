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
    const [iconMode, setIconMode] = useState<'picker' | 'custom'>('picker')

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
    }, [])

    useEffect(() => {
        if (formData.id) {
            const generated = generateSlug(formData.name || '')
            if (formData.slug !== generated) {
                setManuallyEditedSlug(true)
            } else {
                setManuallyEditedSlug(false)
            }
        } else {
            setManuallyEditedSlug(false)
        }
    }, [formData.id])

    useEffect(() => {
        if (formData.icon && formData.icon.trim().startsWith('<svg')) {
            setIconMode('custom')
        } else {
            setIconMode('picker')
        }
    }, [formData.id])

    const isCustomSvg = formData.icon && formData.icon.trim().startsWith('<svg')

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
                <div className="flex items-center justify-between">
                    <Label>Icono</Label>
                    <div className="flex items-center gap-2 text-sm">
                        <button
                            type="button"
                            onClick={() => setIconMode('picker')}
                            className={`px-3 py-1 rounded ${iconMode === 'picker'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            Icon Picker
                        </button>
                        <button
                            type="button"
                            onClick={() => setIconMode('custom')}
                            className={`px-3 py-1 rounded ${iconMode === 'custom'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            Upload SVG
                        </button>
                    </div>
                </div>

                {iconMode === 'picker' ? (
                    <IconPicker
                        value={!isCustomSvg ? (formData.icon as IconName | undefined) : undefined}
                        onValueChange={(icon) => setFormData({ ...formData, icon })}
                    />
                ) : (
                    <div className="space-y-2">
                        <div className="flex flex-col gap-2">
                            <Input
                                id="customSvg"
                                type="file"
                                accept=".svg"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        if (!file.name.endsWith('.svg')) {
                                            alert('Please upload an SVG file')
                                            return
                                        }
                                        const text = await file.text()
                                        setFormData({ ...formData, icon: text })
                                    }
                                }}
                                className="cursor-pointer"
                            />
                            {formData.icon && formData.icon.trim().startsWith('<svg') && (
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon: '' })}
                                    className="text-sm text-destructive hover:underline self-start"
                                >
                                    Remove SVG
                                </button>
                            )}
                        </div>
                        {formData.icon && formData.icon.trim().startsWith('<svg') && (
                            <div className="flex items-center gap-2">
                                <Label>Preview:</Label>
                                <div
                                    className="w-8 h-8 flex items-center justify-center border rounded p-1"
                                    dangerouslySetInnerHTML={{ __html: formData.icon }}
                                />
                            </div>
                        )}
                    </div>
                )}
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
