'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AdminNav } from '@/components/admin/AdminNav'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
    id: string
    name: string
    slug: string
    categoryId: string
    category?: { name: string }
    pricing: any
    coverImages: any[]
    inStock: boolean
    isActive: boolean
    featured: boolean
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products?limit=100')
            const data = await res.json()
            setProducts(data.docs || [])
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return

        try {
            await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
            fetchProducts()
        } catch (error) {
            console.error('Error deleting product:', error)
        }
    }

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase()),
    )

    return (
        <div className="min-h-screen bg-background">
            <AdminNav />

            <main className="lg:pl-64 pt-20 lg:pt-0">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h1 className="text-3xl font-bold">Products</h1>
                        <Link href="/admin/products/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Product
                            </Button>
                        </Link>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-card rounded-lg border border-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            No products found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProducts.map((product) => {
                                        const coverImages = (product.coverImages as any[]) || []
                                        const primaryImage = coverImages.find((img: any) => img.isPrimary)
                                        const imageUrl = primaryImage?.url || coverImages[0]?.url || ''
                                        const pricing = product.pricing as any
                                        const price = pricing?.price || 0

                                        return (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    {imageUrl ? (
                                                        <div className="relative w-12 h-12 rounded overflow-hidden">
                                                            <Image
                                                                src={imageUrl}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 bg-muted rounded" />
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                <TableCell>{product.category?.name || 'N/A'}</TableCell>
                                                <TableCell>${price.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {product.isActive ? (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700">
                                                                Active
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary">Inactive</Badge>
                                                        )}
                                                        {product.featured && <Badge>Featured</Badge>}
                                                        {!product.inStock && (
                                                            <Badge variant="destructive">Out of Stock</Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/product/${product.slug}`} target="_blank">
                                                            <Button variant="ghost" size="icon">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/admin/products/${product.id}`}>
                                                            <Button variant="ghost" size="icon">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(product.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </main>
        </div>
    )
}
