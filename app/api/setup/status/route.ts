import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        const userCount = await prisma.user.count()

        if (userCount > 0) {
            return new NextResponse(null, { status: 404 })
        }

        return NextResponse.json({
            initialized: false
        })
    } catch (error) {
        console.error('Failed to check setup status:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
