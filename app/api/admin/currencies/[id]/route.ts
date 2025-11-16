import { NextRequest, NextResponse } from 'next/server'
import { requireApiAuth } from '@/lib/session'
import { prisma } from '@/lib/db'
import { currencyUpdateSchema } from '@/lib/api-validators'

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireApiAuth(request)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
        const { id } = await params
        const data = await request.json()
        const parsed = currencyUpdateSchema.safeParse(data)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
        }

        const payload = parsed.data

        const currency = await prisma.currency.update({
            where: { id },
            data: {
                name: payload.name,
                code: payload.code,
                symbol: payload.symbol,
                symbolPosition: payload.symbolPosition || 'before',
                decimalSeparator: payload.decimalSeparator || '.',
                thousandsSeparator: payload.thousandsSeparator || ',',
                decimalPlaces: payload.decimalPlaces || 2,
                isActive: payload.isActive ?? true,
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
    const session = await requireApiAuth(request)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
        const { id } = await params
        await prisma.currency.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting currency:', error)
        return NextResponse.json({ error: 'Failed to delete currency' }, { status: 500 })
    }
}
