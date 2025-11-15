import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const slug = searchParams.get('slug')
        const categoryId = searchParams.get('categoryId')

        const where: any = { isActive: true }

        if (slug) {
            where.slug = slug
        }

        if (categoryId) {
            where.categoryId = categoryId
        }

        if (slug) {
            const subcategory = await prisma.subcategory.findFirst({
                where,
                include: { category: true },
            })

            return NextResponse.json({
                docs: subcategory ? [subcategory] : [],
                totalDocs: subcategory ? 1 : 0,
            })
        }

        const subcategories = await prisma.subcategory.findMany({
            where,
            orderBy: { name: 'asc' },
            include: { category: true },
        })

        return NextResponse.json({
            docs: subcategories,
            totalDocs: subcategories.length,
        })
    } catch (error) {
        console.error('Error fetching subcategories:', error)
        return NextResponse.json(
            { error: 'Failed to fetch subcategories' },
            { status: 500 }
        )
    }
}
