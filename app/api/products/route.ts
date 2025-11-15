import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams

        // Pagination
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '12')
        const skip = (page - 1) * limit

        // Sort
        const sort = searchParams.get('sort') || '-createdAt'
        let orderBy: any = {}

        if (sort === '-createdAt') {
            orderBy = { id: 'desc' }
        } else if (sort === 'createdAt') {
            orderBy = { id: 'asc' }
        } else if (sort === 'name') {
            orderBy = { name: 'asc' }
        } else if (sort === '-name') {
            orderBy = { name: 'desc' }
        } else if (sort === 'price') {
            orderBy = { id: 'asc' } // Can't directly sort by JSON field
        } else if (sort === '-price') {
            orderBy = { id: 'desc' } // Can't directly sort by JSON field
        }

        // Build where clause
        const where: any = {
            isActive: true,
        }

        // Category filter
        const categoryId = searchParams.get('category')
        if (categoryId) {
            where.categoryId = categoryId
        }

        // Subcategory filter
        const subcategoryId = searchParams.get('subcategory')
        if (subcategoryId) {
            where.subcategoryId = subcategoryId
        }

        // In stock filter
        const inStock = searchParams.get('inStock')
        if (inStock === 'true') {
            where.inStock = true
        }

        // Featured filter
        const featured = searchParams.get('featured')
        if (featured === 'true') {
            where.featured = true
        }

        // Search filter (name or description)
        const search = searchParams.get('search')
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { shortDescription: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        // Fetch products with count
        const [products, totalDocs] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    category: true,
                    subcategory: true,
                },
            }),
            prisma.product.count({ where }),
        ])

        const totalPages = Math.ceil(totalDocs / limit)

        return NextResponse.json({
            docs: products,
            totalDocs,
            limit,
            totalPages,
            page,
            pagingCounter: skip + 1,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
        })
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}
