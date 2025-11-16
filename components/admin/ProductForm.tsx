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
import { AdminNav } from '@/components/admin/AdminNav'
import { Upload, X, Loader2, Plus, Trash2 } from 'lucide-react'
import type { Currency } from '@/lib/currency-client'
import Image from 'next/image'

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
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [subcategories, setSubcategories] = useState<Subcategory[]>([])
    const [uploadingImage, setUploadingImage] = useState(false)
    const [currencies, setCurrencies] = useState<Currency[]>([])

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchCategories()
        if (productId) {
            fetchProduct()
        }
        fetchCurrencies()
    }, [productId])

    useEffect(() => {
        if (formData.categoryId) {
            fetchSubcategories(formData.categoryId)
        }
    }, [formData.categoryId])

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories')
            const data = await res.json()
            setCategories(data.docs || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const fetchSubcategories = async (categoryId: string) => {
        try {
            const res = await fetch(`/api/subcategories?categoryId=${categoryId}`)
            const data = await res.json()
            setSubcategories(data.docs || [])
        } catch (error) {
            console.error('Error fetching subcategories:', error)
        }
    }

    const fetchProduct = async () => {
        if (!productId) return

        setLoading(true)
        try {
            const res = await fetch(`/api/admin/products/${productId}`)
            const product = await res.json()

            setFormData({
                name: product.name,
                slug: product.slug,
                description: product.description,
                shortDescription: product.shortDescription || '',
                categoryId: product.categoryId,
                subcategoryId: product.subcategoryId || '',
                coverImages: (product.coverImages || []).map((img: { url: string; alt: string; isPrimary: boolean }) => ({ ...img, isUploaded: true })),
                // We manage prices with `prices` instead of a single `pricing` JSON field
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
        } catch (error) {
            console.error('Error fetching product:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCurrencies = async () => {
        try {
            const res = await fetch('/api/currencies')
            const data = await res.json()
            setCurrencies(data || [])
        } catch (error) {
            console.error('Error fetching currencies:', error)
        }
    }

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

        try {
            let updatedCoverImages = formData.coverImages
            const pendingImages = formData.coverImages.filter(img => !img.isUploaded)
            if (pendingImages.length > 0) {
                setUploadingImage(true)
                try {
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
                } catch (error) {
                    console.error('Error uploading images:', error)
                    alert('Failed to upload images')
                    setSaving(false)
                    return
                } finally {
                    setUploadingImage(false)
                }
            }

            const submitData = {
                ...formData,
                coverImages: updatedCoverImages.map((img) => ({ url: img.url, alt: img.alt, isPrimary: img.isPrimary, isUploaded: img.isUploaded })),
            }
            // If prices are provided, attach them to the payload using currency codes (server expects `currency` code)
            if (submitData.prices && submitData.prices.length > 0) {
                submitData.prices = (submitData.prices as PriceInput[]).map((p) => ({
                    price: p.price,
                    salePrice: p.salePrice ?? null,
                    currency: p.currency,
                    isDefault: p.isDefault ?? false,
                    taxIncluded: p.taxIncluded ?? true,
                }))
            }

            const url = productId
                ? `/api/admin/products/${productId}`
                : '/api/admin/products'
            const method = productId ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
            })

            if (res.ok) {
                router.push('/admin/products')
                router.refresh()
            } else {
                alert('Failed to save product')
            }
        } catch (error) {
            console.error('Error saving product:', error)
            alert('Failed to save product')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <AdminNav />
                <main className="lg:pl-64 pt-20 lg:pt-0">
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
            <main className="lg:pl-64 pt-20 lg:pt-0">
                <div className="p-8 max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">
                        {productId ? 'Edit Product' : 'Create Product'}
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
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
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug *</Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="shortDescription">Short Description</Label>
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
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        rows={6}
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Prices (multiple currencies) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Prices (multiple currencies)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {(formData.prices ?? []).map((p, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                        <div className="space-y-2">
                                            <Label>Currency</Label>
                                            <Select
                                                value={p.currency || currencies[0]?.code || 'USD'}
                                                onValueChange={(value) => {
                                                    const newPrices = [...(formData.prices || [])]
                                                    newPrices[idx] = { ...newPrices[idx], currency: value }
                                                    setFormData({ ...formData, prices: newPrices })
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select currency" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {currencies.map((c) => (
                                                        <SelectItem key={c.id} value={c.code}>{c.symbol} {c.code} - {c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Price</Label>
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
                                            <Label>Sale Price</Label>
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

                                        <div className="space-y-2">
                                            <Label>Tax Included</Label>
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
                                            <Label>Default</Label>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        const newPrices = (formData.prices || []).map((x, i) => ({ ...x, isDefault: i === idx }))
                                                        setFormData({ ...formData, prices: newPrices })
                                                    }}
                                                >
                                                    Set
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
                                        <Plus className="h-4 w-4 mr-2" /> Add Price
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Category */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Category</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category *</Label>
                                        <Select
                                            value={formData.categoryId}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, categoryId: value, subcategoryId: '' })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subcategory">Subcategory</Label>
                                        <Select
                                            value={formData.subcategoryId || "none"}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, subcategoryId: value === "none" ? "" : value })
                                            }
                                            disabled={!formData.categoryId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select subcategory" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {subcategories.map((sub) => (
                                                    <SelectItem key={sub.id} value={sub.id}>
                                                        {sub.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Images */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Images</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                                            Primary
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
                                                                Set Primary
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
                                            {uploadingImage ? 'Uploading...' : 'Add Images'}
                                        </span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploadingImage}
                                        />
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing: handled by `Prices (multiple currencies)` section below */}

                        {/* Specifications */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Specifications</CardTitle>
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
                                        <Label htmlFor="weight">Weight</Label>
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
                                        <Label htmlFor="weightUnit">Weight Unit</Label>
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
                                <CardTitle>Status</CardTitle>
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
                                    <Label htmlFor="isActive">Active</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="inStock"
                                        checked={formData.inStock}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, inStock: checked })
                                        }
                                    />
                                    <Label htmlFor="inStock">In Stock</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="featured"
                                        checked={formData.featured}
                                        onCheckedChange={(checked) =>
                                            setFormData({ ...formData, featured: checked })
                                        }
                                    />
                                    <Label htmlFor="featured">Featured</Label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex gap-4">
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}
