'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, ChevronDown, ChevronUp, Copy } from 'lucide-react'
import type { Currency } from '@/lib/currency-client'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

export interface VariantPrice {
    price: number
    salePrice?: number | null
    currency: string
    isDefault?: boolean
    taxIncluded?: boolean
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
}

interface ProductVariantsFormProps {
    variants: Variant[]
    onChange: (variants: Variant[]) => void
    currencies: Currency[]
}

export function ProductVariantsForm({ variants, onChange, currencies }: ProductVariantsFormProps) {
    const [openVariantIndex, setOpenVariantIndex] = useState<number | null>(null)

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
            }]
        }
        onChange([...variants, newVariant])
        setOpenVariantIndex(variants.length) // Open the new variant
    }

    const removeVariant = (index: number) => {
        const newVariants = variants.filter((_, i) => i !== index)
        onChange(newVariants)
        if (openVariantIndex === index) setOpenVariantIndex(null)
    }

    const updateVariant = (index: number, data: Partial<Variant>) => {
        const newVariants = [...variants]
        newVariants[index] = { ...newVariants[index], ...data }
        onChange(newVariants)
    }

    const updateVariantPrice = (variantIndex: number, priceIndex: number, data: Partial<VariantPrice>) => {
        const newVariants = [...variants]
        const newPrices = [...newVariants[variantIndex].prices]
        newPrices[priceIndex] = { ...newPrices[priceIndex], ...data }
        newVariants[variantIndex].prices = newPrices
        onChange(newVariants)
    }

    const addPriceToVariant = (variantIndex: number) => {
        const defaultCurrency = currencies[0]?.code || 'USD'
        const newVariants = [...variants]
        newVariants[variantIndex].prices.push({
            price: 0,
            currency: defaultCurrency,
            isDefault: false,
            taxIncluded: true
        })
        onChange(newVariants)
    }

    const removePriceFromVariant = (variantIndex: number, priceIndex: number) => {
        const newVariants = [...variants]
        newVariants[variantIndex].prices = newVariants[variantIndex].prices.filter((_, i) => i !== priceIndex)
        onChange(newVariants)
    }

    const duplicateVariant = (index: number) => {
        const variantToCopy = variants[index]
        const newVariant = {
            ...variantToCopy,
            id: undefined, // Clear ID for new variant
            name: `${variantToCopy.name} (Copia)`,
            sku: variantToCopy.sku ? `${variantToCopy.sku}-copy` : ''
        }
        const newVariants = [...variants]
        newVariants.splice(index + 1, 0, newVariant)
        onChange(newVariants)
        setOpenVariantIndex(index + 1)
    }

    return (
        <div className="space-y-4">
            {variants.map((variant, index) => (
                <Card key={index} className="border border-border">
                    <Collapsible
                        open={openVariantIndex === index}
                        onOpenChange={(isOpen) => setOpenVariantIndex(isOpen ? index : null)}
                    >
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4 flex-1">
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                                        {openVariantIndex === index ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </Button>
                                </CollapsibleTrigger>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        placeholder="Nombre de variante (ej. Rojo / L)"
                                        value={variant.name}
                                        onChange={(e) => updateVariant(index, { name: e.target.value })}
                                        className="h-8"
                                    />
                                    <Input
                                        placeholder="SKU"
                                        value={variant.sku || ''}
                                        onChange={(e) => updateVariant(index, { sku: e.target.value })}
                                        className="h-8"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Label className="text-xs whitespace-nowrap">Stock:</Label>
                                        <Input
                                            type="number"
                                            value={variant.stock}
                                            onChange={(e) => updateVariant(index, { stock: parseInt(e.target.value) || 0 })}
                                            className="h-8 w-24"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => duplicateVariant(index)}
                                    title="Duplicar variante"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => removeVariant(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <CollapsibleContent>
                            <div className="px-4 pb-4 space-y-4 border-t pt-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Precios</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addPriceToVariant(index)}
                                        >
                                            <Plus className="h-3 w-3 mr-1" /> Agregar Precio
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {variant.prices.map((price, pIndex) => (
                                            <div key={pIndex} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end bg-muted/30 p-3 rounded-md">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Moneda</Label>
                                                    <select
                                                        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                        value={price.currency}
                                                        onChange={(e) => updateVariantPrice(index, pIndex, { currency: e.target.value })}
                                                    >
                                                        {currencies.map(c => (
                                                            <option key={c.id} value={c.code}>{c.code}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Precio</Label>
                                                    <Input
                                                        type="number"
                                                        className="h-8"
                                                        value={price.price}
                                                        onChange={(e) => updateVariantPrice(index, pIndex, { price: parseFloat(e.target.value) || 0 })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Oferta</Label>
                                                    <Input
                                                        type="number"
                                                        className="h-8"
                                                        value={price.salePrice ?? ''}
                                                        onChange={(e) => updateVariantPrice(index, pIndex, { salePrice: e.target.value ? parseFloat(e.target.value) : null })}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 pb-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive"
                                                        onClick={() => removePriceFromVariant(index, pIndex)}
                                                        disabled={variant.prices.length === 1}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </Card>
            ))}

            <Button
                type="button"
                variant="outline"
                className="w-full border-dashed"
                onClick={addVariant}
            >
                <Plus className="h-4 w-4 mr-2" /> Agregar Variante
            </Button>
        </div>
    )
}
