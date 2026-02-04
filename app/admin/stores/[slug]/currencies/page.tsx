"use client"

import AdminResource from '@/components/admin/admin-resource'
import { useParams } from 'next/navigation'
export default function CurrenciesPage() {
    const params = useParams<{ slug?: string }>()
    const storeSlug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug
    const fetchUrl = storeSlug
        ? `/api/admin/currencies?storeSlug=${encodeURIComponent(storeSlug)}`
        : '/api/admin/currencies'

    return (
        <div className="min-h-screen bg-background">

            <main className="md:pt-20 lg:pt-0">
                <div className="">
                    <AdminResource
                        title="Monedas"
                        fetchUrl={fetchUrl}
                        columns={[
                            { header: 'Nombre', accessor: 'name' },
                            { header: 'Código', accessor: 'code' },
                            { header: 'Símbolo', accessor: 'symbol' },
                            { header: 'Formato', render: (c: any) => (c.symbolPosition === 'before' ? `${c.symbol} 1${c.decimalSeparator}${'0'.repeat(c.decimalPlaces)}` : `1${c.decimalSeparator}${'0'.repeat(c.decimalPlaces)} ${c.symbol}`) },
                            { header: 'Estado', render: (c: any) => (c.isActive ? 'Activo' : 'Inactivo') },
                        ]}
                        formFields={[
                            { name: 'name', label: 'Nombre', type: 'text', required: true },
                            { name: 'code', label: 'Código', type: 'text', required: true },
                            { name: 'symbol', label: 'Símbolo', type: 'text', required: true },
                            { name: 'symbolPosition', label: 'Posición del Símbolo', type: 'hidden', defaultValue: 'before' },
                            { name: 'decimalSeparator', label: 'Separador Decimal', type: 'hidden', defaultValue: '.' },
                            { name: 'thousandsSeparator', label: 'Separador de Miles', type: 'hidden', defaultValue: ',' },
                            { name: 'decimalPlaces', label: 'Lugares Decimales', type: 'hidden', defaultValue: 2 },
                            { name: 'isActive', label: 'Activo', type: 'hidden', defaultValue: true },
                        ]}
                        searchKeys={['name', 'code']}
                    />
                </div>
            </main>
        </div>
    )
}
