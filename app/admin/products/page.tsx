'use client'

import { useState, useEffect } from 'react'
import { formatPrice as formatCurrencyPrice } from '@/lib/currency-client'
import { toNumber } from '@/lib/number'
import { Plus, Search, Edit, Trash2, Eye, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface Product {
    id: string
    name: string
    slug: string
    categoryId: string
    category?: { name: string }
    prices?: any[]
    coverImages: any[]
    inStock: boolean
    isActive: boolean
    featured: boolean
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState<Product | null>(null)

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
            toast.error('Failed to load products')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        const product = products.find(p => p.id === id)
        if (product) {
            setProductToDelete(product)
            setDialogOpen(true)
        }
    }

    const confirmDelete = async () => {
        if (!productToDelete) return
        const deletingToastId = toast.loading('Deleting product...')

        try {
            const res = await fetch(`/api/admin/products/${productToDelete.id}`, { method: 'DELETE' })
            if (!res.ok) {
                console.error('Failed to delete product:', res)
                toast.error('Failed to delete product', { id: deletingToastId })
                return
            }

            toast.success('Product deleted', { id: deletingToastId })
            fetchProducts()
            setDialogOpen(false)
            setProductToDelete(null)
        } catch (error) {
            console.error('Error deleting product:', error)
            toast.error('Failed to delete product', { id: deletingToastId })
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
                                aria-label="Search products by name"
                            />
                            <p className="text-xs text-muted-foreground mt-2">Search by product name, slug or SKU. Results update as you type.</p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-card rounded-lg border border-border" aria-busy={loading ? true : undefined}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Category</TableHead>
                                    <TableHead className="hidden md:table-cell">Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="flex gap-4 w-full justify-center">
                                                    <Skeleton className="w-12 h-12 rounded" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-4 w-3/4" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                    <div className="hidden md:block">
                                                        <Skeleton className="h-4 w-24" />
                                                    </div>
                                                    <div className="hidden md:block">
                                                        <Skeleton className="h-4 w-20" />
                                                    </div>
                                                </div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" /> Fetching products...
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <div>
                                                <div className="text-lg font-medium">No products found</div>
                                                <div className="text-sm text-muted-foreground mt-2">Try clearing the search or add a new product.</div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProducts.map((product) => {
                                        const coverImages = (product.coverImages as any[]) || []
                                        const primaryImage = coverImages.find((img: any) => img.isPrimary)
                                        const imageUrl = primaryImage?.url || coverImages[0]?.url || ''
                                        const defaultPriceObj = (product as any).prices?.find((p: any) => p.isDefault) || (product as any).prices?.[0]
                                        // Convert Prisma Decimal (serialized as string) or other types to number
                                        const price = toNumber(defaultPriceObj ? (defaultPriceObj.saleAmount ?? defaultPriceObj.amount) : 0)

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
                                                <TableCell className="hidden md:table-cell">{product.category?.name || 'N/A'}</TableCell>
                                                <TableCell className="hidden md:table-cell">{formatCurrencyPrice(price, defaultPriceObj?.currency ?? null)}</TableCell>
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

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{productToDelete?.name}&quot;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
