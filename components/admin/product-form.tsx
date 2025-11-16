'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminNav } from '@/components/admin/admin-nav'
import { Upload, X, Loader2, Plus, Trash2 } from 'lucide-react'
import type { Currency } from '@/lib/currency-client'
import Image from 'next/image'
import { toast } from 'sonner'
import { trpc } from '@/trpc/client'

interface Category {
    id: string
    name: string
}

interface Subcategory {
    id: string
    name: string
    categoryId: string
}

interface ProductFormData {
    name: string
    slug: string
    description: string
    shortDescription: string
    categoryId: string
    subcategoryId: string
    coverImages: Array<{ url: string; alt: string; isPrimary: boolean; isUploaded: boolean; file?: File }>
    // pricing JSON removed; use `prices` list instead
    prices?: Array<{ price: number; salePrice?: number | null; currency: string; isDefault?: boolean; taxIncluded?: boolean }>
    specifications: {
        sku?: string
        weight?: number
        weightUnit?: string
        dimensions?: {
            length: number
            width: number
            height: number
            unit: string
        }
    }
    isActive: boolean
    inStock: boolean
    featured: boolean
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

export function ProductForm({ productId }: ProductFormProps) {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)

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
    })

    const { data: categoriesData, isLoading: categoriesLoading } = trpc.categories.list.useQuery()
    const categories: Category[] = (categoriesData as any)?.docs || []

    const { data: subcategoriesData, isLoading: subcategoriesLoading } = trpc.subcategories.list.useQuery(
        { categoryId: formData.categoryId },
        { enabled: !!formData.categoryId }
    )
    const subcategories: Subcategory[] = (subcategoriesData as any)?.docs || []

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
                coverImages: (product.coverImages || []).map((img: any) => ({ ...img, isUploaded: true })),
                prices: (product.prices || []).map((p: any) => ({
                    price: p.amount ?? p.price ?? 0,
                    salePrice: p.saleAmount ?? p.salePrice ?? undefined,
                    currency: p.currency?.code || p.currency || '',
                    isDefault: p.isDefault ?? false,
                    taxIncluded: p.taxIncluded ?? true,
                })),
                specifications: product.specifications || {},
                isActive: product.isActive,
                inStock: product.inStock,
                featured: product.featured,
            })
        }
    }, [productData])

    const createProductMutation = trpc.admin.products.create.useMutation()
    const updateProductMutation = trpc.admin.products.update.useMutation()

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

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
        setSaving(true)
        let savingToastId: string | number | undefined

        try {
            let updatedCoverImages = formData.coverImages
            const pendingImages = formData.coverImages.filter(img => !img.isUploaded)
            if (pendingImages.length > 0) {
                setUploadingImage(true)
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
                } catch (error) {
                    console.error('Error uploading images:', error)
                    toast.error('Error al subir imágenes', { id: uploadToastId })
                    setSaving(false)
                    return
                } finally {
                    setUploadingImage(false)
                }
            }

            const submitData = {
                ...formData,
                coverImages: updatedCoverImages.map((img) => ({ url: img.url, alt: img.alt, isPrimary: img.isPrimary })),
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
            toast.error('Error al guardar producto', { id: savingToastId })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <AdminNav />
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
            <AdminNav />
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
                                {uploadingImage && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Subiendo imágenes... Por favor espera.
                                    </div>
                                )}
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
                                                slug: formData.slug || generateSlug(name),
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
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
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
                                            setFormData({ ...formData, shortDescription: e.target.value })
                                        }
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Descripción *</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        rows={6}
                                        required
                                        aria-required={true}
                                    />
                                    <p className="text-xs text-muted-foreground">Requerido — una descripción completa ayuda a los clientes y motores de búsqueda. Usa markdown si es soportado.</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Prices (multiple currencies) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Precios (múltiples monedas)</CardTitle>
                                <p className="text-xs text-muted-foreground mt-1">Agrega precios para todas las monedas que soportas. Un precio debe marcarse como predeterminado para la moneda principal.</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {(formData.prices ?? []).map((p, idx) => (
                                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
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
                                                value={p.price}
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value)
                                                    const newPrices = [...(formData.prices || [])]
                                                    newPrices[idx] = { ...newPrices[idx], price: isNaN(value) ? 0 : value }
                                                    setFormData({ ...formData, prices: newPrices })
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Precio de Venta</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={p.salePrice ?? ''}
                                                onChange={(e) => {
                                                    const value = e.target.value ? parseFloat(e.target.value) : undefined
                                                    const newPrices = [...(formData.prices || [])]
                                                    newPrices[idx] = { ...newPrices[idx], salePrice: value }
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
                                                    size="sm"
                                                    onClick={() => {
                                                        const newPrices = (formData.prices || []).map((x, i) => ({ ...x, isDefault: i === idx }))
                                                        setFormData({ ...formData, prices: newPrices })
                                                    }}
                                                >
                                                    Establecer
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => {
                                                    const newPrices = (formData.prices || []).filter((_, i) => i !== idx)
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
                                            <div key={index} className="relative group">
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
                                                    {!img.isUploaded && (
                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        {!img.isPrimary && (
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="secondary"
                                                                onClick={() => setPrimaryImage(index)}
                                                            >
                                                                Establecer como Principal
                                                            </Button>
                                                        )}
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => removeImage(index)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null
                                    )}

                                    <label className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                        <span className="text-sm text-muted-foreground">
                                            {uploadingImage ? 'Subiendo...' : 'Agregar Imágenes'}
                                        </span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploadingImage}
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
                                        value={formData.specifications.sku || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                specifications: { ...formData.specifications, sku: e.target.value },
                                            })
                                        }
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="weight">Peso</Label>
                                        <Input
                                            id="weight"
                                            type="number"
                                            step="0.01"
                                            value={formData.specifications.weight || ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    specifications: {
                                                        ...formData.specifications,
                                                        weight: e.target.value ? parseFloat(e.target.value) : undefined,
                                                    },
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="weightUnit">Unidad de Peso</Label>
                                        <Input
                                            id="weightUnit"
                                            value={formData.specifications.weightUnit || 'g'}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    specifications: {
                                                        ...formData.specifications,
                                                        weightUnit: e.target.value,
                                                    },
                                                })
                                            }
                                        />
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
            </main>
        </div>
    )
}
