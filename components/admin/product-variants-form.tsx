'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Copy, Upload, Star, Edit } from 'lucide-react'
import type { Currency } from '@/lib/currency-client'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Specifications } from '@/lib/api-validators'
import { Separator } from '@/components/ui/separator'
import { createNumberInputHandlers } from '@/lib/number-input'
import { CreateCurrencyDialog } from './product-form/dialogs/CreateResourceDialogs'
import { useCreateCurrency } from './product-form/hooks/useCreateDialogs'
import { SpecificationsFormFields } from './product-form/sections/SpecificationsFormFields'

export interface VariantPrice {
    price: number
    salePrice?: number | null
    currency: string
    isDefault?: boolean
    taxIncluded?: boolean
}

export interface VariantImage {
    url: string
    alt: string
    isPrimary: boolean
    isUploaded: boolean
    file?: File
}

export interface Variant {
    id?: string
    name: string
    sku?: string
    stock: number
    prices: VariantPrice[]
    isActive: boolean
    attributes?: any
    image?: string
    description?: string
    shortDescription?: string
    specifications?: Specifications
    coverImages?: VariantImage[]
}

interface ProductVariantsFormProps {
    variants: Variant[]
    onChange: (variants: Variant[]) => void
    currencies: Currency[]
    storeSlug?: string
}

export function ProductVariantsForm({ variants, onChange, currencies }: ProductVariantsFormProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const openVariantEditor = (index: number) => {
        const params = new URLSearchParams(searchParams)
        params.set('variant', String(index))
        router.push(`${pathname}?${params.toString()}`)
    }

    const addVariant = () => {
        const defaultCurrency = currencies[0]?.code || 'USD'
        const newVariant: Variant = {
            name: '',
            sku: '',
            stock: 0,
            isActive: true,
            prices: [{
                price: 0,
                currency: defaultCurrency,
                isDefault: true,
                taxIncluded: true
            }],
            specifications: {},
            coverImages: []
        }
        onChange([...variants, newVariant])
        openVariantEditor(variants.length)
    }

    const removeVariant = (index: number) => {
        const newVariants = variants.filter((_, i) => i !== index)
        onChange(newVariants)
    }

    const duplicateVariant = (index: number) => {
        const variantToCopy = variants[index]
        const newVariant = {
            ...variantToCopy,
            id: undefined,
            name: `${variantToCopy.name} (Copia)`,
            sku: variantToCopy.sku ? `${variantToCopy.sku}-copy` : '',
            coverImages: variantToCopy.coverImages?.map(img => ({ ...img, isUploaded: img.isUploaded }))
        }
        const newVariants = [...variants]
        newVariants.splice(index + 1, 0, newVariant)
        onChange(newVariants)
    }

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Imagen</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead className="text-right">Precio</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {variants.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                No hay variantes. Haz clic en &quot;Agregar Variante&quot; para crear una.
                            </TableCell>
                        </TableRow>
                    ) : (
                        variants.map((variant, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <div className="h-12 w-12 relative rounded-md overflow-hidden border border-border bg-muted">
                                        {variant.coverImages && variant.coverImages.length > 0 ? (
                                            <Image
                                                src={variant.coverImages.find(i => i.isPrimary)?.url || variant.coverImages[0].url}
                                                alt={variant.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full w-full text-muted-foreground">
                                                <span className="text-xs">-</span>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {variant.name || <span className="text-muted-foreground">Nueva Variante</span>}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {variant.sku || '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    {variant.stock}
                                </TableCell>
                                <TableCell className="text-right">
                                    {variant.prices.length > 0
                                        ? `${variant.prices[0].currency} ${variant.prices[0].price}`
                                        : <span className="text-muted-foreground">-</span>}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openVariantEditor(index)}
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Editar
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => duplicateVariant(index)}
                                            title="Duplicar"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => removeVariant(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Button type="button" onClick={addVariant} className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Variante
            </Button>
        </div>
    )
}

interface ProductVariantEditorProps {
    variants: Variant[]
    variantIndex: number
    onChange: (variants: Variant[]) => void
    currencies: Currency[]
    storeSlug?: string
}

export function ProductVariantEditor({
    variants,
    variantIndex,
    onChange,
    currencies,
    storeSlug,
}: ProductVariantEditorProps) {
    const currencyDialog = useCreateCurrency(storeSlug)
    const currentVariant = variants[variantIndex]

    const updateVariant = (index: number, data: Partial<Variant>) => {
        const newVariants = [...variants]
        newVariants[index] = { ...newVariants[index], ...data }
        onChange(newVariants)
    }

    const updateVariantPrice = (index: number, priceIndex: number, data: Partial<VariantPrice>) => {
        const newVariants = [...variants]
        const newPrices = [...newVariants[index].prices]
        newPrices[priceIndex] = { ...newPrices[priceIndex], ...data }
        newVariants[index].prices = newPrices
        onChange(newVariants)
    }

    const addPriceToVariant = (index: number) => {
        const defaultCurrency = currencies[0]?.code || 'USD'
        const newVariants = [...variants]
        newVariants[index].prices.push({
            price: 0,
            currency: defaultCurrency,
            isDefault: false,
            taxIncluded: true
        })
        onChange(newVariants)
    }

    const removePriceFromVariant = (index: number, priceIndex: number) => {
        const newVariants = [...variants]
        newVariants[index].prices = newVariants[index].prices.filter((_, i) => i !== priceIndex)
        onChange(newVariants)
    }

    const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const newImages = Array.from(files).map((file, idx) => ({
            url: URL.createObjectURL(file),
            alt: file.name,
            isPrimary: (variants[index].coverImages?.length || 0) === 0 && idx === 0,
            isUploaded: false,
            file,
        }))

        const currentImages = variants[index].coverImages || []
        updateVariant(index, { coverImages: [...currentImages, ...newImages] })
    }

    const removeImage = (index: number, imageIndex: number) => {
        const currentImages = variants[index].coverImages || []
        const img = currentImages[imageIndex]
        if (!img.isUploaded) {
            URL.revokeObjectURL(img.url)
        }
        const newImages = currentImages.filter((_, i) => i !== imageIndex)
        if (img.isPrimary && newImages.length > 0) {
            newImages[0].isPrimary = true
        }
        updateVariant(index, { coverImages: newImages })
    }

    const setPrimaryImage = (index: number, imageIndex: number) => {
        const currentImages = variants[index].coverImages || []
        const newImages = currentImages.map((img, i) => ({
            ...img,
            isPrimary: i === imageIndex,
        }))
        updateVariant(index, { coverImages: newImages })
    }

    if (!currentVariant) {
        return (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No se encontró la variante seleccionada.
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Información Básica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input
                            placeholder="ej. Rojo / L"
                            value={currentVariant.name}
                            onChange={(e) => updateVariant(variantIndex, { name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>SKU</Label>
                        <Input
                            placeholder="SKU-123"
                            value={currentVariant.sku || ''}
                            onChange={(e) => updateVariant(variantIndex, { sku: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Stock</Label>
                        <Input
                            type="number"
                            value={currentVariant.stock}
                            {...createNumberInputHandlers({
                                onChange: (value) => updateVariant(variantIndex, { stock: value as any }),
                                defaultValue: 0,
                                parseType: 'int',
                            })}
                        />
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                        <Switch
                            checked={currentVariant.isActive}
                            onCheckedChange={(checked) => updateVariant(variantIndex, { isActive: checked })}
                        />
                        <Label>Activo</Label>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Descriptions */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Descripciones</h3>
                <div className="space-y-2">
                    <Label>Descripción Corta</Label>
                    <Textarea
                        value={currentVariant.shortDescription || ''}
                        onChange={(e) => updateVariant(variantIndex, { shortDescription: e.target.value })}
                        rows={2}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Descripción Completa</Label>
                    <Textarea
                        value={currentVariant.description || ''}
                        onChange={(e) => updateVariant(variantIndex, { description: e.target.value })}
                        rows={4}
                    />
                </div>
            </div>

            <Separator />

            {/* Prices */}
            <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Precios</h3>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => currencyDialog.setIsOpen(true)}>
                            <Plus className="h-3 w-3 mr-1" /> Nueva Moneda
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => addPriceToVariant(variantIndex)}>
                            <Plus className="h-3 w-3 mr-1" /> Agregar Precio
                        </Button>
                    </div>
                </div>
                <div className="space-y-3">
                    {currentVariant.prices.map((price, pIndex) => (
                        <Card key={pIndex} className="p-3">
                            <div className="grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-12 sm:col-span-4 space-y-1">
                                    <Label className="text-xs">Precio</Label>
                                    <Input
                                        type="number"
                                        value={price.price}
                                        {...createNumberInputHandlers({
                                            onChange: (value) => updateVariantPrice(variantIndex, pIndex, { price: value as any }),
                                            defaultValue: 0,
                                            parseType: 'float',
                                        })}
                                        className="h-8"
                                    />
                                </div>
                                <div className="col-span-12 sm:col-span-4 space-y-1">
                                    <Label className="text-xs">Oferta</Label>
                                    <Input
                                        type="number"
                                        value={price.salePrice ?? ''}
                                        {...createNumberInputHandlers({
                                            onChange: (value) => updateVariantPrice(variantIndex, pIndex, { salePrice: value as any }),
                                            defaultValue: null,
                                            parseType: 'float',
                                        })}
                                        className="h-8"
                                    />
                                </div>
                                <div className="col-span-10 sm:col-span-3 space-y-1">
                                    <Label className="text-xs">Moneda</Label>
                                    <Select
                                        value={price.currency || currencies[0]?.code || 'USD'}
                                        onValueChange={(val) => updateVariantPrice(variantIndex, pIndex, { currency: val })}
                                    >
                                        <SelectTrigger className="h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencies.length === 0 ? (
                                                <div className="px-4 py-2 text-sm text-muted-foreground">
                                                    No hay monedas disponibles
                                                </div>
                                            ) : (
                                                currencies.map(c => (
                                                    <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-2 sm:col-span-1 flex justify-end">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => removePriceFromVariant(variantIndex, pIndex)}
                                        disabled={currentVariant.prices.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Images */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Imágenes</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                    {(currentVariant.coverImages || []).map((img, imgIndex) => (
                        <div key={imgIndex} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                            <Image
                                src={img.url}
                                alt={img.alt || 'Variant image'}
                                fill
                                className="object-cover"
                            />
                            {img.isPrimary && (
                                <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                                    Principal
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {!img.isPrimary && (
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="secondary"
                                        className="h-8 w-8"
                                        onClick={() => setPrimaryImage(variantIndex, imgIndex)}
                                    >
                                        <Star className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    className="h-8 w-8"
                                    onClick={() => removeImage(variantIndex, imgIndex)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    <label className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-all">
                        <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Subir</span>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleImageUpload(variantIndex, e)}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            <Separator />

            {/* Specifications */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Especificaciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SpecificationsFormFields
                        specifications={currentVariant.specifications || {}}
                        onUpdate={(updates) => updateVariant(variantIndex, {
                            specifications: { ...(currentVariant.specifications || {}), ...updates }
                        })}
                    />
                </div>
            </div>

            <CreateCurrencyDialog
                open={currencyDialog.isOpen}
                onOpenChange={currencyDialog.setIsOpen}
                data={currencyDialog.data}
                onDataChange={currencyDialog.setData}
                onConfirm={currencyDialog.handleCreate}
                isLoading={currencyDialog.isLoading}
            />
        </div>
    )
}
