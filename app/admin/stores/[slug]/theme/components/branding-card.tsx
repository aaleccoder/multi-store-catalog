'use client'

import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StoreTheme } from '@/lib/theme'

interface BrandingCardProps {
    branding: NonNullable<StoreTheme['branding']>
    onBrandingChange: (key: keyof NonNullable<StoreTheme['branding']>, value: string | number | undefined) => void
    onLogoFile: (file: File) => void
    uploading: boolean
}

export const BrandingCard = ({ branding, onBrandingChange, onLogoFile, uploading }: BrandingCardProps) => (
    <Card>
        <CardHeader>
            <CardTitle>Identidad de la tienda</CardTitle>
            <CardDescription>Configura el logo que se mostrara en el storefront.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="logo-url">Logo (URL)</Label>
                <Input
                    id="logo-url"
                    value={branding.logoUrl ?? ''}
                    onChange={(e) => onBrandingChange('logoUrl', e.target.value)}
                    placeholder="https://.../logo.png"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="logo-alt">Texto alternativo</Label>
                <Input
                    id="logo-alt"
                    value={branding.logoAlt ?? ''}
                    onChange={(e) => onBrandingChange('logoAlt', e.target.value)}
                    placeholder="Nombre de la tienda"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="logo-width">Ancho (px)</Label>
                    <Input
                        id="logo-width"
                        type="number"
                        min={16}
                        value={branding.logoWidth ?? ''}
                        onChange={(e) => onBrandingChange('logoWidth', e.target.value ? Number(e.target.value) : undefined)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="logo-height">Alto (px)</Label>
                    <Input
                        id="logo-height"
                        type="number"
                        min={16}
                        value={branding.logoHeight ?? ''}
                        onChange={(e) => onBrandingChange('logoHeight', e.target.value ? Number(e.target.value) : undefined)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Vista previa</Label>
                <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-border bg-muted/30">
                    {branding.logoUrl ? (
                        <Image
                            src={branding.logoUrl}
                            alt={branding.logoAlt ?? 'Logo de la tienda'}
                            width={branding.logoWidth ?? 100}
                            height={branding.logoHeight ?? 100}
                            className="object-contain max-h-28"
                        />
                    ) : (
                        <span className="text-sm text-muted-foreground">Anade la URL de tu logo.</span>
                    )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) onLogoFile(file)
                        }}
                        disabled={uploading}
                    />
                    {uploading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Subiendo...
                        </div>
                    )}
                </div>
            </div>
        </CardContent>
    </Card>
)
