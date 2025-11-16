import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        const currencies = await prisma.currency.findMany({ orderBy: { code: 'asc' } })
        return NextResponse.json(currencies)
    } catch (error) {
        console.error('Error fetching currencies:', error)
        return NextResponse.json({ error: 'Failed to fetch currencies' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        const currency = await prisma.currency.create({
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
        console.error('Error creating currency:', error)
        return NextResponse.json({ error: 'Failed to create currency' }, { status: 500 })
    }
}
