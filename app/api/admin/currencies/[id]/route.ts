import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const data = await request.json()

        const currency = await prisma.currency.update({
            where: { id },
            data: {
                name: data.name,
                code: data.code,
                symbol: data.symbol,
                symbolPosition: data.symbolPosition || 'before',
                decimalSeparator: data.decimalSeparator || '.',
                thousandsSeparator: data.thousandsSeparator || ',',
                decimalPlaces: data.decimalPlaces || 2,
                isActive: data.isActive ?? true,
            },
        })

        return NextResponse.json(currency)
    } catch (error) {
        console.error('Error updating currency:', error)
        return NextResponse.json({ error: 'Failed to update currency' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.currency.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting currency:', error)
        return NextResponse.json({ error: 'Failed to delete currency' }, { status: 500 })
    }
}
