'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Category {
    id: string
    name: string
}

interface Subcategory {
    id: string
    name: string
    slug: string
    description?: string | null
    categoryId: string
    category?: Category
    isActive: boolean
    _count?: { products: number }
}

export default function SubcategoriesPage() {
    const [subcategories, setSubcategories] = useState<Subcategory[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [categoriesLoading, setCategoriesLoading] = useState(false)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterCategory, setFilterCategory] = useState<string>('all')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        categoryId: '',
        isActive: true,
    })

    useEffect(() => {
        fetchCategories()
        fetchSubcategories()
    }, [])

    const fetchCategories = async () => {
        setCategoriesLoading(true)
        try {
            const res = await fetch('/api/categories')
            const data = await res.json()
            setCategories(data.docs || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            setCategoriesLoading(false)
        }
    }

    const fetchSubcategories = async () => {
        try {
            const res = await fetch('/api/admin/subcategories')
            const data = await res.json()
            setSubcategories(data || [])
        } catch (error) {
            console.error('Error fetching subcategories:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = editingSubcategory
                ? `/api/admin/subcategories/${editingSubcategory.id}`
                : '/api/admin/subcategories'

            const method = editingSubcategory ? 'PUT' : 'POST'

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            setDialogOpen(false)
            resetForm()
            fetchSubcategories()
        } catch (error) {
            console.error('Error saving subcategory:', error)
        }
    }

    const handleEdit = (subcategory: Subcategory) => {
        setEditingSubcategory(subcategory)
        setFormData({
            name: subcategory.name,
            slug: subcategory.slug,
            description: subcategory.description || '',
            categoryId: subcategory.categoryId,
            isActive: subcategory.isActive,
        })
        setDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this subcategory?')) return

        try {
            await fetch(`/api/admin/subcategories/${id}`, { method: 'DELETE' })
            fetchSubcategories()
        } catch (error) {
            console.error('Error deleting subcategory:', error)
        }
    }

    const resetForm = () => {
        setEditingSubcategory(null)
        setFormData({ name: '', slug: '', description: '', categoryId: '', isActive: true })
    }

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

    const filteredSubcategories = subcategories.filter((sub) => {
        const matchesSearch = sub.name.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = filterCategory === 'all' || sub.categoryId === filterCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="min-h-screen bg-background">
            <AdminNav />

            <main className="lg:pl-64 pt-20 lg:pt-0">
                <div className="p-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h1 className="text-3xl font-bold">Subcategories</h1>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={resetForm}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Subcategory
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {editingSubcategory
                                            ? 'Update the subcategory details'
                                            : 'Create a new subcategory'}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category *</Label>
                                            <Select
                                                value={formData.categoryId}
                                                onValueChange={(value) =>
                                                    setFormData({ ...formData, categoryId: value })
                                                }
                                                aria-busy={categoriesLoading}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categoriesLoading ? (
                                                        <div className="px-4 py-2 flex items-center justify-center text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin mr-2" />Loading categories...</div>
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
                                            <Label htmlFor="description">Description</Label>
                                            <Input
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, description: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">
                                            {editingSubcategory ? 'Update' : 'Create'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                        <div className="relative max-w-sm flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search subcategories..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="bg-card rounded-lg border border-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Products</TableHead>
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
                                ) : filteredSubcategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            No subcategories found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredSubcategories.map((subcategory) => (
                                        <TableRow key={subcategory.id}>
                                            <TableCell className="font-medium">{subcategory.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{subcategory.slug}</TableCell>
                                            <TableCell>{subcategory.category?.name || 'N/A'}</TableCell>
                                            <TableCell>{subcategory._count?.products || 0}</TableCell>
                                            <TableCell>
                                                {subcategory.isActive ? (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">Inactive</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(subcategory)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(subcategory.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </main>
        </div>
    )
}
