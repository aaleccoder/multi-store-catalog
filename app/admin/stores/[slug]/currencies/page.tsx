"use client"

import AdminResource from '@/components/admin/admin-resource'
import { useParams } from 'next/navigation'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export default function CurrenciesPage() {
    const params = useParams<{ slug?: string }>()
    const storeSlug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug
    const fetchUrl = storeSlug
        ? `/api/admin/currencies?storeSlug=${encodeURIComponent(storeSlug)}`
        : '/api/admin/currencies'
    
    const [isInactiveOpen, setIsInactiveOpen] = useState(false)

    const columns = [
        { header: 'Nombre', accessor: 'name' },
        { header: 'Código', accessor: 'code' },
        { header: 'Símbolo', accessor: 'symbol' },
        { header: 'Formato', render: (c: any) => (c.symbolPosition === 'before' ? `${c.symbol} 1${c.decimalSeparator}${'0'.repeat(c.decimalPlaces)}` : `1${c.decimalSeparator}${'0'.repeat(c.decimalPlaces)} ${c.symbol}`) },
    ]

    const formFields = [
        { name: 'name', label: 'Nombre', type: 'text' as const, required: true },
        { name: 'code', label: 'Código', type: 'text' as const, required: true },
        { name: 'symbol', label: 'Símbolo', type: 'text' as const, required: true },
        { name: 'symbolPosition', label: 'Posición del Símbolo', type: 'hidden' as const, defaultValue: 'before' },
        { name: 'decimalSeparator', label: 'Separador Decimal', type: 'hidden' as const, defaultValue: '.' },
        { name: 'thousandsSeparator', label: 'Separador de Miles', type: 'hidden' as const, defaultValue: ',' },
        { name: 'decimalPlaces', label: 'Lugares Decimales', type: 'hidden' as const, defaultValue: 2 },
        { name: 'isActive', label: 'Activo', type: 'switch' as const, defaultValue: true },
    ]

    return (
        <div className="min-h-screen bg-background">
            <main className="">
                <div className="space-y-6">
                    <AdminResource
                        title="Monedas Activas"
                        fetchUrl={fetchUrl}
                        listTransform={(data: any) => (Array.isArray(data) ? data : []).filter((item: any) => item.isActive)}
                        columns={columns}
                        formFields={formFields}
                        searchKeys={['name', 'code']}
                    />

                    <Collapsible open={isInactiveOpen} onOpenChange={setIsInactiveOpen}>
                        <CollapsibleTrigger className="flex w-full items-center justify-between border-b pb-2">
                            <h2 className="text-2xl font-bold">Monedas Inactivas</h2>
                            <ChevronDown 
                                className={`h-5 w-5 transition-transform ${isInactiveOpen ? 'rotate-180' : ''}`}
                            />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-4">
                            <AdminResource
                                title=""
                                fetchUrl={fetchUrl}
                                listTransform={(data: any) => (Array.isArray(data) ? data : []).filter((item: any) => !item.isActive)}
                                columns={columns}
                                formFields={formFields}
                                searchKeys={['name', 'code']}
                            />
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </main>
        </div>
    )
}
