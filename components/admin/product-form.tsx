'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Editor } from '@/components/ui/editor'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Loader2, Plus, Trash2, Star } from 'lucide-react'
import type { Currency } from '@/lib/currency-client'
import Image from 'next/image'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error-messages'
import { trpc } from '@/trpc/client'
import { ProductInput, Specifications } from '@/lib/api-validators'
import { ProductVariantsForm, Variant } from './product-variants-form'

interface Category {
    id: string
    name: string
}

interface Subcategory {
    id: string
    name: string
    categoryId: string
}

type ProductFormData = Omit<ProductInput, 'coverImages' | 'specifications'> & {
    coverImages: Array<{ url: string; alt: string; isPrimary: boolean; isUploaded: boolean; file?: File }>
    specifications: Specifications
    variants: Variant[]
    hasVariants: boolean
}

interface PriceInput {
    price: number
    salePrice?: number | null
    currency: string
    isDefault?: boolean
    taxIncluded?: boolean
}

interface ProductFormProps {
    productId?: string
}

const generateSlug = (name: string) => {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

const sanitizeSlugInput = (value: string) => {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
}

export function ProductForm({ productId }: ProductFormProps) {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [manuallyEditedSlug, setManuallyEditedSlug] = useState(false)

    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        slug: '',
        description: '',
        shortDescription: '',
        categoryId: '',
        subcategoryId: '',
        coverImages: [],
        // pricing removed in favor of `prices`
        prices: [],
        specifications: {},
        isActive: true,
        inStock: true,
        featured: false,
        variants: [],
        hasVariants: false,
    })

    const { data: categoriesData, isLoading: categoriesLoading } = trpc.admin.categories.list.useQuery()
    const categories: Category[] = categoriesData || []

    const { data: subcategoriesData, isLoading: subcategoriesLoading } = trpc.admin.subcategories.list.useQuery(
        { categoryId: formData.categoryId },
        { enabled: !!formData.categoryId }
    )
    const subcategories: Subcategory[] = subcategoriesData || []

    const { data: currenciesData, isLoading: currenciesLoading } = trpc.currencies.list.useQuery()
    const currencies: Currency[] = (currenciesData as Currency[]) || []

    const { data: productData, isLoading: loading } = trpc.admin.products.get.useQuery(
        productId || '',
        {
            enabled: !!productId,
        }
    )

    useEffect(() => {
        if (productData) {
            const product = productData as any
            setFormData({
                name: product.name,
                slug: product.slug,
                description: product.description,
                shortDescription: product.shortDescription || '',
                categoryId: product.categoryId,
                subcategoryId: product.subcategoryId || '',
                coverImages: (product.coverImages || []).map((img: any, index: number) => ({ ...img, isUploaded: true, isPrimary: index === 0 })),
                prices: (product.prices || []).map((p: any) => ({
                    price: p.amount ?? p.price ?? 0,
                    salePrice: p.saleAmount ?? p.salePrice ?? undefined,
                    currency: p.currency?.code || p.currency || '',
                    isDefault: (product.prices || []).length === 1 ? true : (p.isDefault ?? false),
                    taxIncluded: p.taxIncluded ?? true,
                })),
                specifications: product.specifications || {},
                isActive: product.isActive,
                inStock: product.inStock,
                featured: product.featured,
                variants: (product.variants || []).map((v: any) => ({
                    id: v.id,
                    name: v.name,
                    sku: v.sku,
                    stock: v.stock,
                    isActive: v.isActive,
                    description: v.description,
                    shortDescription: v.shortDescription,
                    specifications: v.specifications || {},
                    coverImages: (v.images || []).map((img: any, index: number) => ({ ...img, isUploaded: true, isPrimary: index === 0 })),
                    prices: (v.prices || []).map((p: any) => ({
                        price: Number(p.amount),
                        salePrice: p.saleAmount ? Number(p.saleAmount) : undefined,
                        currency: p.currency?.code || p.currency || '',
                        isDefault: p.isDefault ?? false,
                        taxIncluded: p.taxIncluded ?? true,
                    }))
                })),
                hasVariants: (product.variants || []).length > 0,
            })
            setManuallyEditedSlug(product.slug !== generateSlug(product.name))
        }
    }, [productData])

    const createProductMutation = trpc.admin.products.create.useMutation()
    const updateProductMutation = trpc.admin.products.update.useMutation()

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const newImages = Array.from(files).map((file, idx) => ({
            url: URL.createObjectURL(file),
            alt: file.name,
            isPrimary: formData.coverImages.length === 0 && idx === 0,
            isUploaded: false,
            file,
        }))

        setFormData({
            ...formData,
            coverImages: [...formData.coverImages, ...newImages],
        })
    }

    const removeImage = (index: number) => {
        const img = formData.coverImages[index]
        if (!img.isUploaded) {
            URL.revokeObjectURL(img.url)
        }
        const newImages = formData.coverImages.filter((_, i) => i !== index)
        if (img.isPrimary && newImages.length > 0) {
            newImages[0].isPrimary = true
        }
        setFormData({ ...formData, coverImages: newImages })
    }

    const setPrimaryImage = (index: number) => {
        const newImages = formData.coverImages.map((img, i) => ({
            ...img,
            isPrimary: i === index,
        }))
        setFormData({ ...formData, coverImages: newImages })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate required fields
        if (!formData.categoryId) {
            toast.error('Por favor selecciona una categoría')
            return
        }

        setSaving(true)
        let savingToastId: string | number | undefined

        try {
            let updatedCoverImages = formData.coverImages
            const pendingImages = formData.coverImages.filter(img => !img.isUploaded)
            if (pendingImages.length > 0) {
                let uploadToastId: string | number | undefined
                try {
                    uploadToastId = toast.loading('Uploading images...')
                    const uploadPromises = pendingImages.map(async (img) => {
                        const formDataToUpload = new FormData()
                        formDataToUpload.append('file', img.file!)
                        formDataToUpload.append('alt', img.alt)

                        const res = await fetch('/api/admin/media', {
                            method: 'POST',
                            body: formDataToUpload,
                        })

                        const media = await res.json()
                        return { ...img, url: media.url, alt: media.alt, isUploaded: true }
                    })

                    const uploadedImages = await Promise.all(uploadPromises)
                    updatedCoverImages = formData.coverImages.map(img => {
                        const uploaded = uploadedImages.find(u => u.file === img.file)
                        return uploaded || img
                    })

                    // Revoke object URLs
                    pendingImages.forEach(img => URL.revokeObjectURL(img.url))
                    toast.success('Imágenes subidas', { id: uploadToastId })
                } catch (uploadError) {
                    console.error('Error uploading images:', uploadError)
                    toast.error(getErrorMessage(uploadError), { id: uploadToastId })
                    setSaving(false)
                    return
                }
            }

            const primaryImage = updatedCoverImages.find(img => img.isPrimary);
            const otherImages = updatedCoverImages.filter(img => !img.isPrimary);
            const orderedImages = primaryImage ? [primaryImage, ...otherImages] : otherImages;

            const submitData = {
                ...formData,
                coverImages: orderedImages.map((img) => ({ url: img.url, alt: img.alt })),
            }
            // If prices are provided, attach them to the payload using currency codes (server expects `currency` code)
            if (submitData.prices && submitData.prices.length > 0) {
                (submitData as any).prices = (submitData.prices as PriceInput[]).map((p) => ({
                    price: p.price,
                    salePrice: p.salePrice ?? null,
                    currency: p.currency,
                    isDefault: p.isDefault ?? false,
                    taxIncluded: p.taxIncluded ?? true,
                }))
            }

            // Handle variants
            if (submitData.hasVariants) {
                const processedVariants = await Promise.all(submitData.variants.map(async (v) => {
                    let variantImages = v.coverImages || []
                    const pendingVariantImages = variantImages.filter(img => !img.isUploaded)

                    if (pendingVariantImages.length > 0) {
                        const uploadPromises = pendingVariantImages.map(async (img) => {
                            const formDataToUpload = new FormData()
                            formDataToUpload.append('file', img.file!)
                            formDataToUpload.append('alt', img.alt)

                            const res = await fetch('/api/admin/media', {
                                method: 'POST',
                                body: formDataToUpload,
                            })

                            if (!res.ok) throw new Error('Failed to upload variant image')

                            const media = await res.json()
                            return { ...img, url: media.url, alt: media.alt, isUploaded: true }
                        })

                        const uploadedImages = await Promise.all(uploadPromises)
                        variantImages = variantImages.map(img => {
                            const uploaded = uploadedImages.find(u => u.file === img.file)
                            return uploaded || img
                        })

                        // Revoke object URLs for this variant
                        pendingVariantImages.forEach(img => URL.revokeObjectURL(img.url))
                    }

                    const primaryImage = variantImages.find(img => img.isPrimary);
                    const otherImages = variantImages.filter(img => !img.isPrimary);
                    const orderedImages = primaryImage ? [primaryImage, ...otherImages] : otherImages;

                    return {
                        id: v.id,
                        name: v.name,
                        sku: v.sku,
                        stock: v.stock,
                        isActive: v.isActive,
                        attributes: v.attributes,
                        image: v.image, // Keep legacy image field if needed, or maybe remove it?
                        description: v.description,
                        shortDescription: v.shortDescription,
                        specifications: v.specifications,
                        coverImages: orderedImages.map((img) => ({ url: img.url, alt: img.alt })),
                        prices: v.prices?.map(p => ({
                            price: p.price,
                            salePrice: p.salePrice ?? null,
                            currency: p.currency,
                            isDefault: p.isDefault ?? false,
                            taxIncluded: p.taxIncluded ?? true,
                        }))
                    }
                }));
                (submitData as any).variants = processedVariants
            } else {
                (submitData as any).variants = []
            }

            savingToastId = toast.loading('Guardando producto...')

            if (productId) {
                await updateProductMutation.mutateAsync({ id: productId, data: submitData as any })
            } else {
                await createProductMutation.mutateAsync(submitData as any)
            }

            toast.success('Producto guardado', { id: savingToastId })
            router.push('/admin/products')
            router.refresh()
        } catch (error) {
            console.error('Error saving product:', error)
            toast.error(getErrorMessage(error), { id: savingToastId })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <main className=" pt-20 lg:pt-0">
                    <div className="p-8 flex items-center justify-center min-h-screen">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <main className=" pt-20 lg:pt-0">
                <div className="md:p-8 md:max-w-4xl p-2 mx-auto">
                    <h1 className="text-3xl font-bold mb-6">
                        {productId ? 'Editar Producto' : 'Crear Producto'}
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Información Básica</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => {
                                            const name = e.target.value
                                            setFormData({
                                                ...formData,
                                                name,
                                                slug: manuallyEditedSlug ? formData.slug : generateSlug(name),
                                            })
                                        }}
                                        required
                                        aria-required={true}
                                    />
                                    <p className="text-xs text-muted-foreground">Requerido — usado para listados de productos y SEO. Un buen nombre ayuda a las conversiones.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug *</Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => {
                                            const value = e.target.value
                                            if (value === '') {
                                                setManuallyEditedSlug(false)
                                                setFormData({ ...formData, slug: generateSlug(formData.name) })
                                            } else {
                                                setManuallyEditedSlug(true)
                                                setFormData({ ...formData, slug: sanitizeSlugInput(value) })
                                            }
                                        }}
                                        required
                                        aria-required={true}
                                    />
                                    <p className="text-xs text-muted-foreground">Requerido — slug único usado en URLs de productos, auto-generado desde el nombre cuando está vacío.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="shortDescription">Descripción Corta</Label>
                                    <Textarea
                                        id="shortDescription"
                                        value={formData.shortDescription}
                                        onChange={(e) =>
                                            setFormData({ ...formData, shortDescription: e.target.value.slice(0, 150) })
                                        }
                                        rows={2}
                                        maxLength={150}
                                    />
                                    <p className="text-xs text-muted-foreground">{formData.shortDescription?.length}/150 caracteres</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción *</Label>
                                    <Editor
                                        value={formData.description}
                                        onChange={(value) =>
                                            setFormData({ ...formData, description: value })
                                        }
                                        placeholder="Escribe una descripción detallada del producto..."
                                    />
                                    <p className="text-xs text-muted-foreground">Requerido — una descripción completa ayuda a los clientes y motores de búsqueda. Usa el editor de texto enriquecido para dar formato.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Variants Toggle & Section */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Variantes de Producto</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor="hasVariants">¿Tiene variantes?</Label>
                                        <Switch
                                            id="hasVariants"
                                            checked={formData.hasVariants}
                                            onCheckedChange={(checked) => setFormData({ ...formData, hasVariants: checked })}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Activa esto si el producto tiene múltiples opciones (ej. tallas, colores) con diferentes precios o stock.</p>
                            </CardHeader>
                            {formData.hasVariants && (
                                <CardContent>
                                    <ProductVariantsForm
                                        variants={formData.variants}
                                        onChange={(variants) => setFormData({ ...formData, variants })}
                                        currencies={currencies}
                                    />
                                </CardContent>
                            )}
                        </Card>

                        {/* Prices (multiple currencies) - Hide if has variants */}
                        {!formData.hasVariants && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Precios (múltiples monedas)</CardTitle>
                                    <p className="text-xs text-muted-foreground mt-1">Agrega precios para todas las monedas que soportas. Un precio debe marcarse como predeterminado para la moneda principal.</p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {(formData.prices ?? []).map((p, idx) => (
                                        <div key={idx} className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end p-4 rounded-lg border ${p.isDefault ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                            <div className="space-y-2">
                                                <Label>Moneda</Label>
                                                <Select
                                                    value={p.currency || currencies[0]?.code || 'USD'}
                                                    onValueChange={(value) => {
                                                        const newPrices = [...(formData.prices || [])]
                                                        newPrices[idx] = { ...newPrices[idx], currency: value }
                                                        setFormData({ ...formData, prices: newPrices })
                                                    }}
                                                    aria-busy={currenciesLoading}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar moneda" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {currenciesLoading ? (
                                                            <div className="px-4 py-2 flex items-center justify-center text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mr-2" />Cargando monedas...</div>
                                                        ) : currencies.length === 0 ? (
                                                            <div className="px-4 py-2 text-sm text-muted-foreground">No hay monedas disponibles</div>
                                                        ) : (
                                                            currencies.map((c) => (
                                                                <SelectItem key={c.id} value={c.code}>{c.symbol} {c.code} - {c.name}</SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Precio</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={p.price}
                                                    onChange={(e) => {
                                                        const value = parseFloat(e.target.value)
                                                        const newPrices = [...(formData.prices || [])]
                                                        newPrices[idx] = { ...newPrices[idx], price: isNaN(value) ? 0 : Math.max(0, value) }
                                                        setFormData({ ...formData, prices: newPrices })
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Precio de Venta</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={p.salePrice ?? ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value ? parseFloat(e.target.value) : undefined
                                                        const newPrices = [...(formData.prices || [])]
                                                        newPrices[idx] = { ...newPrices[idx], salePrice: value !== undefined && value < 0 ? undefined : value }
                                                        setFormData({ ...formData, prices: newPrices })
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-2 hidden">
                                                <Label>Impuesto Incluido</Label>
                                                <Switch
                                                    checked={p.taxIncluded ?? true}
                                                    onCheckedChange={(checked) => {
                                                        const newPrices = [...(formData.prices || [])]
                                                        newPrices[idx] = { ...newPrices[idx], taxIncluded: checked }
                                                        setFormData({ ...formData, prices: newPrices })
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Predeterminado</Label>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant={p.isDefault ? "default" : "outline"}
                                                        disabled={p.isDefault}
                                                        onClick={() => {
                                                            const newPrices = (formData.prices || []).map((x, i) => ({ ...x, isDefault: i === idx }))
                                                            setFormData({ ...formData, prices: newPrices })
                                                        }}
                                                    >
                                                        {p.isDefault ? 'Predeterminado' : 'Establecer'}
                                                    </Button>
                                                    <Button size="sm" variant="destructive" onClick={() => {
                                                        let newPrices = (formData.prices || []).filter((_, i) => i !== idx)
                                                        if (newPrices.length === 1) {
                                                            newPrices[0] = { ...newPrices[0], isDefault: true }
                                                        }
                                                        setFormData({ ...formData, prices: newPrices })
                                                    }}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div>
                                        <Button type="button" onClick={() => {
                                            const defaultCurrency = currencies[0]?.code || 'USD'
                                            const newPrices = [...(formData.prices || []), { price: 0, salePrice: undefined, currency: defaultCurrency, isDefault: (formData.prices?.length ?? 0) === 0, taxIncluded: true }]
                                            setFormData({ ...formData, prices: newPrices })
                                        }}>
                                            <Plus className="h-4 w-4 mr-2" /> Agregar Precio
                                        </Button>
                                        <p className="text-sm text-muted-foreground mt-2">Consejo: Agrega precios localizados para cada moneda que soportas. Marca uno como predeterminado. Puedes agregar más de uno por moneda para diferentes puntos de precio.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Category */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Categoría</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Categoría *</Label>
                                        <p className="text-xs text-muted-foreground">Requerido - esto ayuda a los clientes a encontrar tu producto.</p>
                                        <Select
                                            value={formData.categoryId}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, categoryId: value, subcategoryId: '' })
                                            }
                                            aria-required={true}
                                            aria-busy={categoriesLoading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar categoría" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categoriesLoading ? (
                                                    <div className="px-4 py-2 flex items-center justify-center text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mr-2" />Cargando categorías...</div>
                                                ) : categories.length === 0 ? (
                                                    <div className="px-4 py-2 text-sm text-muted-foreground">No se encontraron categorías</div>
                                                ) : (
                                                    categories.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subcategory">Subcategoría</Label>
                                        <p className="text-xs text-muted-foreground">Opcional - elige una categoría más específica si aplica.</p>
                                        <Select
                                            value={formData.subcategoryId || "none"}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, subcategoryId: value === "none" ? "" : value })
                                            }
                                            disabled={!formData.categoryId}
                                            aria-busy={subcategoriesLoading}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar subcategoría" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Ninguna</SelectItem>
                                                {subcategoriesLoading ? (
                                                    <div className="px-4 py-2 flex items-center justify-center text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mr-2" />Cargando subcategorías...</div>
                                                ) : (
                                                    subcategories.map((sub) => (
                                                        <SelectItem key={sub.id} value={sub.id}>
                                                            {sub.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Images */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Imágenes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {formData.coverImages.map((img, index) =>
                                        img.url ? (
                                            <div key={index} className="flex flex-col gap-2">
                                                <div className="aspect-square relative rounded-lg overflow-hidden border-2 border-border">
                                                    <Image
                                                        src={img.url}
                                                        alt={img.alt || 'Product image'}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    {img.isPrimary && (
                                                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                                            Principal
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 justify-center">
                                                    {!img.isPrimary && (
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => setPrimaryImage(index)}
                                                        >
                                                            <Star className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => removeImage(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : null
                                    )}

                                    <label className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                        <span className="text-sm text-muted-foreground">
                                            Agregar Imágenes
                                        </span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <div className="block sm:hidden text-xs text-muted-foreground mt-2 text-center">Consejo: Sube hasta múltiples imágenes, marca una como principal después.</div>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing: handled by `Prices (multiple currencies)` section below */}

                        {/* Specifications */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Especificaciones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input
                                        id="sku"
                                        value={(formData.specifications || {}).sku || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                specifications: { ...(formData.specifications || {}), sku: e.target.value },
                                            })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unit">Unidad</Label>
                                    <Input
                                        id="unit"
                                        placeholder="ej. 6 unidades, 1 paquete"
                                        value={(formData.specifications || {}).unit || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                specifications: { ...(formData.specifications || {}), unit: e.target.value },
                                            })
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">Opcional - cantidad que trae el producto (ej. 6 unidades)</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="weight">Peso</Label>
                                        <Input
                                            id="weight"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={(formData.specifications || {}).weight || ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    specifications: {
                                                        ...(formData.specifications || {}),
                                                        weight: e.target.value ? Math.max(0, parseFloat(e.target.value)) : undefined,
                                                    },
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Unidad de Peso</Label>
                                        <Select
                                            value={(formData.specifications || {}).weightUnit || 'g'}
                                            onValueChange={(value) =>
                                                setFormData({
                                                    ...formData,
                                                    specifications: {
                                                        ...(formData.specifications || {}),
                                                        weightUnit: value,
                                                    },
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="g">g</SelectItem>
                                                <SelectItem value="kg">kg</SelectItem>
                                                <SelectItem value="lbs">lbs</SelectItem>
                                                <SelectItem value="oz">oz</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="volume">Volumen</Label>
                                        <Input
                                            id="volume"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={(formData.specifications || {}).volume || ''}
                                            onChange={(e) => {
                                                const value = e.target.value ? parseFloat(e.target.value) : undefined
                                                setFormData({
                                                    ...formData,
                                                    specifications: {
                                                        ...(formData.specifications || {}),
                                                        volume: value !== undefined && value < 0 ? undefined : value,
                                                    },
                                                })
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Unidad de Volumen</Label>
                                        <Select
                                            value={(formData.specifications || {}).volumeUnit || 'ml'}
                                            onValueChange={(value) =>
                                                setFormData({
                                                    ...formData,
                                                    specifications: {
                                                        ...(formData.specifications || {}),
                                                        volumeUnit: value,
                                                    },
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ml">ml</SelectItem>
                                                <SelectItem value="l">l</SelectItem>
                                                <SelectItem value="fl oz">fl oz</SelectItem>
                                                <SelectItem value="gal">gal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Dimensiones</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="length">Largo</Label>
                                            <Input
                                                id="length"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={(formData.specifications || {}).dimensions?.length || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value ? parseFloat(e.target.value) : undefined
                                                    setFormData({
                                                        ...formData,
                                                        specifications: {
                                                            ...(formData.specifications || {}),
                                                            dimensions: { ...(formData.specifications?.dimensions || {}), length: value !== undefined && value < 0 ? undefined : value },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="width">Ancho</Label>
                                            <Input
                                                id="width"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={(formData.specifications || {}).dimensions?.width || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value ? parseFloat(e.target.value) : undefined
                                                    setFormData({
                                                        ...formData,
                                                        specifications: {
                                                            ...(formData.specifications || {}),
                                                            dimensions: { ...(formData.specifications?.dimensions || {}), width: value !== undefined && value < 0 ? undefined : value },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="height">Alto</Label>
                                            <Input
                                                id="height"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={(formData.specifications || {}).dimensions?.height || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value ? parseFloat(e.target.value) : undefined
                                                    setFormData({
                                                        ...formData,
                                                        specifications: {
                                                            ...(formData.specifications || {}),
                                                            dimensions: { ...(formData.specifications?.dimensions || {}), height: value !== undefined && value < 0 ? undefined : value },
                                                        },
                                                    })
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Unidad</Label>
                                            <Select
                                                value={(formData.specifications || {}).dimensions?.unit || 'cm'}
                                                onValueChange={(value) =>
                                                    setFormData({
                                                        ...formData,
                                                        specifications: {
                                                            ...(formData.specifications || {}),
                                                            dimensions: { ...(formData.specifications?.dimensions || {}), unit: value },
                                                        },
                                                    })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="mm">mm</SelectItem>
                                                    <SelectItem value="cm">cm</SelectItem>
                                                    <SelectItem value="m">m</SelectItem>
                                                    <SelectItem value="in">in</SelectItem>
                                                    <SelectItem value="ft">ft</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Estado</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, isActive: checked })
                                        }
                                    />
                                    <Label htmlFor="isActive">Activo</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="inStock"
                                        checked={formData.inStock}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, inStock: checked })
                                        }
                                    />
                                    <Label htmlFor="inStock">En Stock</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="featured"
                                        checked={formData.featured}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, featured: checked })
                                        }
                                    />
                                    <Label htmlFor="featured">Destacado</Label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                                {saving ? 'Guardando...' : productId ? 'Actualizar Producto' : 'Crear Producto'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={saving}
                                className="w-full sm:w-auto"
                            >
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </div>
            </main >
        </div >
    )
}
