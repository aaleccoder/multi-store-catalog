import { NextRequest, NextResponse } from 'next/server'
import { requireApiAuth } from '@/lib/session'
import { prisma } from '@/lib/db'
import { currencySchema } from '@/lib/api-validators'

export async function GET(request: NextRequest) {
    const session = await requireApiAuth(request)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
        const currencies = await prisma.currency.findMany({ orderBy: { code: 'asc' } })
        return NextResponse.json(currencies)
    } catch (error) {
        console.error('Error fetching currencies:', error)
        return NextResponse.json({ error: 'Failed to fetch currencies' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const session = await requireApiAuth(request)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
        const data = await request.json()
        const parsed = currencySchema.safeParse(data)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
        }

        const payload = parsed.data

        const currency = await prisma.currency.create({
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
        console.error('Error creating currency:', error)
        return NextResponse.json({ error: 'Failed to create currency' }, { status: 500 })
    }
}
