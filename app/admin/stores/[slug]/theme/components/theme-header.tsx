'use client'

import { Loader2, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface StoreOption {
    id: string
    name: string
}

interface ThemeHeaderProps {
    stores?: StoreOption[]
    activeStoreId?: string
    onStoreChange?: (storeId: string) => void
    storeName?: string
    onSave: () => void
    saving: boolean
}

export const ThemeHeader = ({ stores, activeStoreId, onStoreChange, storeName, onSave, saving }: ThemeHeaderProps) => (
    <div className="flex items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <Palette className="h-6 w-6" />
                Tema de la tienda
            </h1>
            <p className="text-sm text-muted-foreground">Ajusta los colores y tipografias usados en la tienda.</p>
        </div>
        <div className="flex gap-3 items-center">
            {stores && stores.length > 1 && onStoreChange ? (
                <>
                    <Label className="text-sm">Tienda</Label>
                    <select
                        className="border border-input rounded-md px-3 py-2 bg-background"
                        value={activeStoreId}
                        onChange={(e) => onStoreChange(e.target.value)}
                    >
                        {stores.map((store) => (
                            <option key={store.id} value={store.id}>
                                {store.name}
                            </option>
                        ))}
                    </select>
                </>
            ) : (
                <span className="text-sm text-muted-foreground">
                    {storeName ? `Tienda: ${storeName}` : 'Tienda actual'}
                </span>
            )}
            <Button onClick={onSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar tema'}
            </Button>
        </div>
    </div>
)
