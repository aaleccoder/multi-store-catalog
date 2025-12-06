'use client'

import { useEffect, useState } from 'react'
import AdminResource from '@/components/admin/admin-resource'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { generateSlug, sanitizeSlugInput } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface StoreFormProps {
    formData: any
    setFormData: (data: any) => void
}

function StoreForm({ formData, setFormData }: StoreFormProps) {
    const [manuallyEditedSlug, setManuallyEditedSlug] = useState(false)

    useEffect(() => {
        if (!formData.name) return
        if (!manuallyEditedSlug) {
            setFormData({ ...formData, slug: generateSlug(formData.name) })
        }
    }, [formData.name])

    return (
        <div className="space-y-4">
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
            <div className="flex items-center space-x-2">
                <Switch
                    id="isActive"
                    checked={!!formData.isActive}
                    onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
                />
                <Label htmlFor="isActive">Activa</Label>
            </div>
        </div>
    )
}

export default function StoresPage() {
    return (
        <div className="min-h-screen bg-background">
            <main className="md:pt-20 lg:pt-0">
                <div className="p-4 md:p-8">
                    <AdminResource
                        title="Mis Tiendas"
                        fetchUrl="/api/admin/stores"
                        columns={[]}
                        renderForm={({ formData, setFormData }) => (
                            <StoreForm formData={formData} setFormData={setFormData} />
                        )}
                        searchKeys={['name', 'slug']}
                        newButtonLabel="Crear tienda"
                        renderList={(items, loading, onEdit, onDelete) => (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {loading && items.length === 0 && (
                                    <div className="text-sm text-muted-foreground">Cargando tiendas...</div>
                                )}
                                {items.map((store: any) => (
                                    <Card key={store.id} className="border-border/70">
                                        <CardHeader className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">{store.name}</CardTitle>
                                                <Badge variant={store.isActive ? 'default' : 'secondary'}>
                                                    {store.isActive ? 'Activa' : 'Inactiva'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">/{store.slug}</p>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <p className="text-sm text-muted-foreground line-clamp-3">
                                                {store.description || 'Sin descripción'}
                                            </p>
                                            <div className="flex gap-2">
                                                <Button className="flex-1" asChild>
                                                    <Link href={`/admin/stores/${store.slug}`}>Administrar</Link>
                                                </Button>
                                                <Button variant="outline" className="flex-1" asChild>
                                                    <Link href={`/store/${store.slug}`}>Ver</Link>
                                                </Button>
                                                <Button variant="secondary" className="flex-1" onClick={() => onEdit(store)}>
                                                    Editar
                                                </Button>
                                                <Button variant="ghost" className="flex-1 text-destructive" onClick={() => onDelete(store.id)}>
                                                    Eliminar
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    />
                </div>
            </main>
        </div>
    )
}
