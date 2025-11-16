"use client"

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { AdminNav } from '@/components/admin/AdminNav'
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface Currency {
    id: string
    name: string
    code: string
    symbol: string
    symbolPosition: string
    decimalSeparator: string
    thousandsSeparator: string
    decimalPlaces: number
    isActive: boolean
}

export default function CurrenciesPage() {
    const [currencies, setCurrencies] = useState<Currency[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        symbol: '',
        symbolPosition: 'before',
        decimalSeparator: '.',
        thousandsSeparator: ',',
        decimalPlaces: 2,
        isActive: true,
    })

    useEffect(() => {
        fetchCurrencies()
    }, [])

    const fetchCurrencies = async () => {
        try {
            const res = await fetch('/api/admin/currencies')
            const data = await res.json()
            setCurrencies(data || [])
        } catch (error) {
            console.error('Error fetching currencies:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = editingCurrency ? `/api/admin/currencies/${editingCurrency.id}` : '/api/admin/currencies'
            const method = editingCurrency ? 'PUT' : 'POST'

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            setDialogOpen(false)
            resetForm()
            fetchCurrencies()
        } catch (error) {
            console.error('Error saving currency:', error)
        }
    }

    const handleEdit = (currency: Currency) => {
        setEditingCurrency(currency)
        setFormData({
            name: currency.name,
            code: currency.code,
            symbol: currency.symbol,
            symbolPosition: currency.symbolPosition || 'before',
            decimalSeparator: currency.decimalSeparator || '.',
            thousandsSeparator: currency.thousandsSeparator || ',',
            decimalPlaces: currency.decimalPlaces || 2,
            isActive: currency.isActive,
        })
        setDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this currency?')) return

        try {
            await fetch(`/api/admin/currencies/${id}`, { method: 'DELETE' })
            fetchCurrencies()
        } catch (error) {
            console.error('Error deleting currency:', error)
        }
    }

    const resetForm = () => {
        setEditingCurrency(null)
        setFormData({
            name: '',
            code: '',
            symbol: '',
            symbolPosition: 'before',
            decimalSeparator: '.',
            thousandsSeparator: ',',
            decimalPlaces: 2,
            isActive: true,
        })
    }

    const filteredCurrencies = currencies.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()),
    )

    return (
        <div className="min-h-screen bg-background">
            <AdminNav />

            <main className="lg:pl-64 pt-20 lg:pt-0">
                <div className="p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h1 className="text-3xl font-bold">Currencies</h1>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={resetForm}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Currency
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingCurrency ? 'Edit Currency' : 'Add Currency'}</DialogTitle>
                                    <DialogDescription>
                                        {editingCurrency ? 'Update currency details' : 'Create a new currency'}
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4 py-4">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Name</Label>
                                                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="code">Code</Label>
                                                <Input id="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="symbol">Symbol</Label>
                                                <Input id="symbol" value={formData.symbol} onChange={(e) => setFormData({ ...formData, symbol: e.target.value })} required />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="symbolPosition">Symbol Position</Label>
                                                <select id="symbolPosition" value={formData.symbolPosition} onChange={(e) => setFormData({ ...formData, symbolPosition: e.target.value })} className="w-full border p-2 rounded">
                                                    <option value="before">Before</option>
                                                    <option value="after">After</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="decimalSeparator">Decimal Separator</Label>
                                                <Input id="decimalSeparator" value={formData.decimalSeparator} onChange={(e) => setFormData({ ...formData, decimalSeparator: e.target.value })} required maxLength={1} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="thousandsSeparator">Thousands Separator</Label>
                                                <Input id="thousandsSeparator" value={formData.thousandsSeparator} onChange={(e) => setFormData({ ...formData, thousandsSeparator: e.target.value })} required maxLength={1} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="decimalPlaces">Decimal Places</Label>
                                                <Input id="decimalPlaces" type="number" min={0} max={6} value={formData.decimalPlaces} onChange={(e) => setFormData({ ...formData, decimalPlaces: parseInt(e.target.value || '0') })} required />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-2">
                                                <Label htmlFor="isActive">Active</Label>
                                                <Switch id="isActive" checked={formData.isActive} onCheckedChange={(val: boolean) => setFormData({ ...formData, isActive: val })} />
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button type="submit">{editingCurrency ? 'Update' : 'Create'}</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search currencies..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-card rounded-lg border border-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Symbol</TableHead>
                                    <TableHead>Format</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                                    </TableRow>
                                ) : filteredCurrencies.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">No currencies found</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCurrencies.map((c) => (
                                        <TableRow key={c.id}>
                                            <TableCell className="font-medium">{c.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{c.code}</TableCell>
                                            <TableCell>{c.symbol}</TableCell>
                                            <TableCell>
                                                {c.symbolPosition === 'before' ? `${c.symbol} 1${c.decimalSeparator}${'0'.repeat(c.decimalPlaces)}` : `1${c.decimalSeparator}${'0'.repeat(c.decimalPlaces)} ${c.symbol}`}
                                            </TableCell>
                                            <TableCell>
                                                {c.isActive ? (
                                                    <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Inactive</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
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
