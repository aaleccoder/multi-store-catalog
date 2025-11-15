import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        const product = await prisma.product.create({
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
                shortDescription: data.shortDescription,
                categoryId: data.categoryId,
                subcategoryId: data.subcategoryId,
                coverImages: data.coverImages || [],
                pricing: data.pricing || {},
                specifications: data.specifications || {},
                filterValues: data.filterValues || [],
                tags: data.tags || [],
                metaData: data.metaData || {},
                isActive: data.isActive ?? true,
                inStock: data.inStock ?? true,
                featured: data.featured ?? false,
            },
        })

        return NextResponse.json(product)
    } catch (error) {
        console.error('Error creating product:', error)
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        )
    }
}
