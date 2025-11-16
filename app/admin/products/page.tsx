'use client'

import { useState, useCallback } from 'react'
import { formatPrice as formatCurrencyPrice } from '@/lib/currency-client'
import { toNumber } from '@/lib/number'
import { Edit, Eye, Loader2, Trash } from 'lucide-react'
import { toast } from 'sonner'
import AdminResource, { Column, FormField } from '@/components/admin/admin-resource'
import { trpc } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AdminNav } from '@/components/admin/admin-nav'
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
    const [dialogOpen, setDialogOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState<Product | null>(null)
    const [deleteFn, setDeleteFn] = useState<((id: string | number) => void) | null>(null)

    const columns: Column<Product>[] = [
        {
            header: 'Imagen',
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
        { header: 'Nombre', accessor: 'name' },
        { header: 'Categoría', accessor: 'category.name' },
        {
            header: 'Precio',
            accessor: 'prices',
            render: (p: Product) => {
                const defaultPriceObj = (p as Product).prices?.find((pr) => pr.isDefault) || (p as Product).prices?.[0]
                const price = toNumber(defaultPriceObj ? (defaultPriceObj.saleAmount ?? defaultPriceObj.amount) : 0)
                return formatCurrencyPrice(price, defaultPriceObj?.currency ?? null)
            },
        },
        {
            header: 'Estado',
            accessor: 'isActive',
            render: (p: Product) => (
                <div className="flex gap-1">
                    {p.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">Activo</Badge>
                    ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                    )}
                    {p.featured && <Badge>Destacado</Badge>}
                    {!p.inStock && <Badge variant="destructive">Agotado</Badge>}
                </div>
            ),
        },
    ]

    const formFields: FormField[] = [
        { name: 'name', label: 'Nombre', type: 'text', required: true },
        { name: 'slug', label: 'Slug', type: 'text' },
        { name: 'shortDescription', label: 'Descripción corta', type: 'textarea' },
        { name: 'categoryId', label: 'Categoría', type: 'select' },
        { name: 'subcategoryId', label: 'Subcategoría', type: 'select' },
        { name: 'isActive', label: 'Activo', type: 'switch' },
        { name: 'inStock', label: 'En stock', type: 'switch' },
        { name: 'featured', label: 'Destacado', type: 'switch' },
    ]

    const catsQuery = trpc.admin.categories.list.useQuery()
    const subsQuery = trpc.admin.subcategories.list.useQuery()

    const loadDependencies = useCallback(async () => {
        // Ensure queries have run
        if (catsQuery.isLoading) await catsQuery.refetch()
        if (subsQuery.isLoading) await subsQuery.refetch()

        const cats = (catsQuery.data ?? []) as CategoryList[]
        const subs = (subsQuery.data ?? []) as SubcategoryList[]

        const mapOptions = (list: CategoryList[] | SubcategoryList[]) => list.map((c) => ({ value: c.id, label: c.name, id: c.id }))

        return {
            categoryId: mapOptions(cats),
            subcategoryId: mapOptions(subs),
        }
    }, [catsQuery, subsQuery])

    const listTransform = useCallback((data: unknown) => ((data as { docs?: Product[] } | null)?.docs || (data as Product[] || [])), [])

    return (
        <div className="min-h-screen bg-background">
            <AdminNav />

            <main className="pt-20 lg:pt-0">
                <div>

                    <div className="bg-card">
                        <AdminResource<Product>
                            title="Productos"
                            fetchUrl={'/api/products?limit=100'}
                            listTransform={listTransform}
                            columns={columns}
                            formFields={formFields}
                            createUrl={'/api/admin/products/'}
                            updateUrl={(id: string) => `/api/admin/products/${id}`}
                            deleteUrl={(id: string) => `/api/admin/products/${id}`}
                            keyField={'id'}
                            newButtonLabel={'Agregar Producto'}
                            createPageUrl={'/admin/products/new'}
                            searchKeys={['name', 'slug']}
                            loadDependencies={loadDependencies}
                            renderList={(items, loading, onEdit, onDelete) => (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Imagen</TableHead>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead className="hidden md:table-cell">Categoría</TableHead>
                                            <TableHead className="hidden md:table-cell">Precio</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
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
                                                            <Loader2 className="h-4 w-4 animate-spin" /> Obteniendo productos...
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : items.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8">
                                                    <div>
                                                        <div className="text-lg font-medium">No se encontraron productos</div>
                                                        <div className="text-sm text-muted-foreground mt-2">Intenta limpiar la búsqueda o agrega un nuevo producto.</div>
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
                                                                    <Badge variant="outline" className="bg-green-50 text-green-700">Activo</Badge>
                                                                ) : (
                                                                    <Badge variant="secondary">Inactivo</Badge>
                                                                )}
                                                                {product.featured && <Badge>Destacado</Badge>}
                                                                {!product.inStock && (
                                                                    <Badge variant="destructive">Agotado</Badge>
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
                                                                    <Trash className="h-4 w-4 hover:text-white" />
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
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Confirmar Eliminación</DialogTitle>
                                    <DialogDescription>
                                        ¿Estás seguro de que quieres eliminar &quot;{productToDelete?.name}&quot;? Esta acción no se puede deshacer.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={async () => {
                                            if (!productToDelete) return
                                            const deletingToastId = toast.loading('Eliminando producto...')

                                            try {
                                                // call AdminResource delete handler
                                                if (deleteFn) await deleteFn(productToDelete.id)
                                                toast.success('Producto eliminado', { id: deletingToastId })
                                            } catch (error) {
                                                console.error(error)
                                                toast.error('Error al eliminar producto', { id: deletingToastId })
                                            } finally {
                                                setDialogOpen(false)
                                                setProductToDelete(null)
                                            }
                                        }}
                                    >
                                        Eliminar
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
