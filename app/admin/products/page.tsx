'use client'

import { useState } from 'react'
import { formatPrice as formatCurrencyPrice } from '@/lib/currency-client'
import { toNumber } from '@/lib/number'
import { Edit, Trash2, Eye, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import AdminResource, { Column, FormField } from '@/components/admin/AdminResource'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
// Input intentionally removed to rely on AdminResource search
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
    prices?: PriceType[]
    coverImages: Media[]
    inStock: boolean
    isActive: boolean
    featured: boolean
    [key: string]: unknown
}

type Media = { id?: string; alt?: string; url?: string; isPrimary?: boolean }
type PriceType = { id?: string; amount?: number | string; saleAmount?: number | string | null; currency?: string | null; isDefault?: boolean }
type CategoryList = { id: string; name: string }
type SubcategoryList = { id: string; name: string }

export default function ProductsPage() {
    // Search handled inside AdminResource
    const [dialogOpen, setDialogOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState<Product | null>(null)
    const [deleteFn, setDeleteFn] = useState<((id: string | number) => void) | null>(null)

    // AdminResource configuration
    const columns: Column<Product>[] = [
        {
            header: 'Image',
            accessor: 'coverImages',
            render: (p: Product) => {
                const coverImages = (p.coverImages as Media[]) || []
                const primaryImage = coverImages.find((img) => img.isPrimary)
                const imageUrl = primaryImage?.url || coverImages[0]?.url || ''

                return imageUrl ? (
                    <div className="relative w-12 h-12 rounded overflow-hidden">
                        <Image src={imageUrl} alt={p.name} fill className="object-cover" />
                    </div>
                ) : (
                    <div className="w-12 h-12 bg-muted rounded" />
                )
            },
        },
        { header: 'Name', accessor: 'name' },
        { header: 'Category', accessor: 'category.name' },
        {
            header: 'Price',
            accessor: 'prices',
            render: (p: Product) => {
                const defaultPriceObj = (p as Product).prices?.find((pr) => pr.isDefault) || (p as Product).prices?.[0]
                const price = toNumber(defaultPriceObj ? (defaultPriceObj.saleAmount ?? defaultPriceObj.amount) : 0)
                return formatCurrencyPrice(price, defaultPriceObj?.currency ?? null)
            },
        },
        {
            header: 'Status',
            accessor: 'isActive',
            render: (p: Product) => (
                <div className="flex gap-1">
                    {p.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                    ) : (
                        <Badge variant="secondary">Inactive</Badge>
                    )}
                    {p.featured && <Badge>Featured</Badge>}
                    {!p.inStock && <Badge variant="destructive">Out of Stock</Badge>}
                </div>
            ),
        },
    ]

    const formFields: FormField[] = [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'slug', label: 'Slug', type: 'text' },
        { name: 'shortDescription', label: 'Short description', type: 'textarea' },
        { name: 'categoryId', label: 'Category', type: 'select' },
        { name: 'subcategoryId', label: 'Subcategory', type: 'select' },
        { name: 'isActive', label: 'Active', type: 'switch' },
        { name: 'inStock', label: 'In stock', type: 'switch' },
        { name: 'featured', label: 'Featured', type: 'switch' },
    ]

    const loadDependencies = async () => {
        const [catsRes, subRes] = await Promise.all([
            fetch('/api/admin/categories'),
            fetch('/api/admin/subcategories'),
        ])

        const [cats, subs] = await Promise.all([catsRes.json(), subRes.json()])

        const mapOptions = (list: CategoryList[] | SubcategoryList[]) => list.map((c) => ({ value: c.id, label: c.name, id: c.id }))

        return {
            categoryId: mapOptions(cats),
            subcategoryId: mapOptions(subs),
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <AdminNav />

            <main className="pt-20 lg:pt-0">
                <div>
                    {/* AdminResource includes header and search; page-level header/search removed to avoid duplicates */}

                    {/* Table handled by AdminResource */}
                    <div className="bg-card">
                        <AdminResource<Product>
                            title="Products"
                            fetchUrl={'/api/products?limit=100'}
                            listTransform={(data: unknown) => ((data as { docs?: Product[] }).docs || (data as Product[]))}
                            columns={columns}
                            formFields={formFields}
                            createUrl={'/api/admin/products'}
                            updateUrl={(id: string) => `/api/admin/products/${id}`}
                            deleteUrl={(id: string) => `/api/admin/products/${id}`}
                            keyField={'id'}
                            newButtonLabel={'Add Product'}
                            searchKeys={['name', 'slug']}
                            loadDependencies={loadDependencies}
                            renderList={(items, loading, onEdit, onDelete) => (
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
                                        ) : items.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8">
                                                    <div>
                                                        <div className="text-lg font-medium">No products found</div>
                                                        <div className="text-sm text-muted-foreground mt-2">Try clearing the search or add a new product.</div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            items.map((product: Product) => {
                                                const coverImages = (product.coverImages as Media[]) || []
                                                const primaryImage = coverImages.find((img) => img.isPrimary)
                                                const imageUrl = primaryImage?.url || coverImages[0]?.url || ''
                                                const defaultPriceObj = (product as Product).prices?.find((p) => p.isDefault) || (product as Product).prices?.[0]
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
                                                                    <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
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
                                                                <Button variant="ghost" size="icon" onClick={() => { setProductToDelete(product); setDeleteFn(() => onDelete); setDialogOpen(true); }}>
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
                            )}
                        />
                        {/* confirmation dialog for deletion */}
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
                                    <Button
                                        variant="destructive"
                                        onClick={async () => {
                                            if (!productToDelete) return
                                            const deletingToastId = toast.loading('Deleting product...')

                                            try {
                                                // call AdminResource delete handler
                                                if (deleteFn) await deleteFn(productToDelete.id)
                                                toast.success('Product deleted', { id: deletingToastId })
                                            } catch (error) {
                                                console.error(error)
                                                toast.error('Failed to delete product', { id: deletingToastId })
                                            } finally {
                                                setDialogOpen(false)
                                                setProductToDelete(null)
                                            }
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </main>

            {/* note: deletion handled within AdminResource's renderList */}
        </div>
    )
}
