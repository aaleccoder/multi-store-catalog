import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        const subcategories = await prisma.subcategory.findMany({
            include: {
                category: true,
                _count: {
                    select: { products: true },
                },
            },
            orderBy: { name: 'asc' },
        })

        return NextResponse.json(subcategories)
    } catch (error) {
        console.error('Error fetching subcategories:', error)
        return NextResponse.json(
            { error: 'Failed to fetch subcategories' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        const subcategory = await prisma.subcategory.create({
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
                categoryId: data.categoryId,
                isActive: data.isActive ?? true,
                filters: data.filters || [],
            },
        })

        return NextResponse.json(subcategory)
    } catch (error) {
        console.error('Error creating subcategory:', error)
        return NextResponse.json(
            { error: 'Failed to create subcategory' },
            { status: 500 }
        )
    }
}
