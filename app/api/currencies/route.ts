import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const currencies = await prisma.currency.findMany({ where: { isActive: true }, orderBy: { code: 'asc' } })
        return NextResponse.json(currencies)
    } catch (error) {
        console.error('Error fetching currencies:', error)
        return NextResponse.json({ error: 'Failed to fetch currencies' }, { status: 500 })
    }
}
