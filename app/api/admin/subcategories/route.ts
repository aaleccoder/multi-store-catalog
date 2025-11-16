import { NextRequest, NextResponse } from 'next/server'
import { requireApiAuth } from '@/lib/session'
import { prisma } from '@/lib/db'
import { subcategorySchema } from '@/lib/api-validators'

export async function GET(request: NextRequest) {
    const session = await requireApiAuth(request)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
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
    const session = await requireApiAuth(request)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
        const data = await request.json()
        const parsed = subcategorySchema.safeParse(data)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
        }

        const payload = parsed.data

        const subcategory = await prisma.subcategory.create({
            data: {
                name: payload.name,
                slug: payload.slug,
                description: payload.description,
                categoryId: payload.categoryId,
                isActive: payload.isActive ?? true,
                filters: payload.filters || [],
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
