'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export interface StoreSelectionProps {
    stores: Array<{ id: string; name: string; slug: string; description: string | null; isActive: boolean }>
}

export function StoreSelectionClient({ stores }: StoreSelectionProps) {
    const router = useRouter()
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleSelect = async (storeId: string) => {
        setLoadingId(storeId)
        try {
            const res = await fetch('/api/admin/select-store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId }),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || 'No se pudo seleccionar la tienda')
            }
            toast.success('Tienda seleccionada')
            router.push('/admin')
            router.refresh()
        } catch (err: any) {
            toast.error(err.message || 'No se pudo seleccionar la tienda')
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
                <Card key={store.id} className="border-border/60">
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
                            <Button
                                className="flex-1"
                                onClick={() => handleSelect(store.id)}
                                disabled={loadingId === store.id}
                            >
                                {loadingId === store.id ? 'Seleccionando...' : 'Usar esta tienda'}
                            </Button>
                            <Button variant="outline" className="flex-1" asChild>
                                <a href={`/store/${store.slug}`} target="_blank" rel="noreferrer">Ver</a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
