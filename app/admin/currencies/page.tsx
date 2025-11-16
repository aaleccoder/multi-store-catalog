"use client"

import AdminResource from '@/components/admin/admin-resource'
import { AdminNav } from '@/components/admin/admin-nav'
export default function CurrenciesPage() {
    return (
        <div className="min-h-screen bg-background">
            <AdminNav />

            <main className=" pt-20 lg:pt-0">
                <div className="p-8">
                    <AdminResource
                        title="Monedas"
                        fetchUrl="/api/admin/currencies"
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
                            { name: 'symbolPosition', label: 'Posición del Símbolo', type: 'select', options: [{ value: 'before', label: 'Antes' }, { value: 'after', label: 'Después' }] },
                            { name: 'decimalSeparator', label: 'Separador Decimal', type: 'text' },
                            { name: 'thousandsSeparator', label: 'Separador de Miles', type: 'text' },
                            { name: 'decimalPlaces', label: 'Lugares Decimales', type: 'number' },
                            { name: 'isActive', label: 'Activo', type: 'switch' },
                        ]}
                        searchKeys={['name', 'code']}
                    />
                </div>
            </main>
        </div>
    )
}
