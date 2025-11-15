import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const slug = searchParams.get('slug')

        if (slug) {
            const category = await prisma.category.findFirst({
                where: { slug, isActive: true },
            })

            return NextResponse.json({
                docs: category ? [category] : [],
                totalDocs: category ? 1 : 0,
            })
        }

        const categories = await prisma.category.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        })

        return NextResponse.json({
            docs: categories,
            totalDocs: categories.length,
        })
    } catch (error) {
        console.error('Error fetching categories:', error)
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        )
    }
}
