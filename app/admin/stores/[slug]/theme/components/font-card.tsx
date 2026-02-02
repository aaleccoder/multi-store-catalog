'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { storeFontOptions, StoreFontId } from '@/lib/store-fonts'

interface FontCardProps {
    selectedFontId: StoreFontId
    onChange: (fontId: StoreFontId) => void
}

export const FontCard = ({ selectedFontId, onChange }: FontCardProps) => (
    <Card>
        <CardHeader>
            <CardTitle>Tipografia</CardTitle>
            <CardDescription>Selecciona la fuente principal de la tienda.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            <div className="space-y-2">
                <Label htmlFor="font-id">Fuente</Label>
                <select
                    id="font-id"
                    className="border border-input rounded-md px-3 py-2 bg-background w-full"
                    value={selectedFontId}
                    onChange={(e) => onChange(e.target.value as StoreFontId)}
                >
                    {storeFontOptions.map((font) => (
                        <option key={font.id} value={font.id}>
                            {font.label}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-muted-foreground">Se aplica a los textos principales y titulos.</p>
            </div>
        </CardContent>
    </Card>
)
