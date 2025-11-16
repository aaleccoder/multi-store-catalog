"use client"

import AdminResource from '@/components/admin/admin-resource'
import { AdminNav } from '@/components/admin/admin-nav'
import { Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react'
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
export default function CurrenciesPage() {
    return (
        <div className="min-h-screen bg-background">
            <AdminNav />

            <main className=" pt-20 lg:pt-0">
                <div className="p-8">
                    <AdminResource
                        title="Currencies"
                        fetchUrl="/api/admin/currencies"
                        columns={[
                            { header: 'Name', accessor: 'name' },
                            { header: 'Code', accessor: 'code' },
                            { header: 'Symbol', accessor: 'symbol' },
                            { header: 'Format', render: (c: any) => (c.symbolPosition === 'before' ? `${c.symbol} 1${c.decimalSeparator}${'0'.repeat(c.decimalPlaces)}` : `1${c.decimalSeparator}${'0'.repeat(c.decimalPlaces)} ${c.symbol}`) },
                            { header: 'Status', render: (c: any) => (c.isActive ? 'Active' : 'Inactive') },
                        ]}
                        formFields={[
                            { name: 'name', label: 'Name', type: 'text', required: true },
                            { name: 'code', label: 'Code', type: 'text', required: true },
                            { name: 'symbol', label: 'Symbol', type: 'text', required: true },
                            { name: 'symbolPosition', label: 'Symbol Position', type: 'select', options: [{ value: 'before', label: 'Before' }, { value: 'after', label: 'After' }] },
                            { name: 'decimalSeparator', label: 'Decimal Separator', type: 'text' },
                            { name: 'thousandsSeparator', label: 'Thousands Separator', type: 'text' },
                            { name: 'decimalPlaces', label: 'Decimal Places', type: 'number' },
                            { name: 'isActive', label: 'Active', type: 'switch' },
                        ]}
                        searchKeys={['name', 'code']}
                    />
                </div>
            </main>
        </div>
    )
}
