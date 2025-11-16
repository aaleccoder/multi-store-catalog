import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { toNumber } from '@/lib/number'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams

        // Pagination
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '12')
        const skip = (page - 1) * limit

        // Sort
        const sort = searchParams.get('sort') || '-createdAt'
        let orderBy = {}

        if (sort === '-createdAt') {
            orderBy = { id: 'desc' }
        } else if (sort === 'createdAt') {
            orderBy = { id: 'asc' }
        } else if (sort === 'name') {
            orderBy = { name: 'asc' }
        } else if (sort === '-name') {
            orderBy = { name: 'desc' }
        } else if (sort === 'price') {
            // Order by the minimum price.amount for the product (first available price)
            orderBy = { prices: { _min: { amount: 'asc' } } }
        } else if (sort === '-price') {
            orderBy = { prices: { _max: { amount: 'desc' } } }
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

        // Currency filter (select products that have a price in the given currency)
        const currency = searchParams.get('currency')
        if (currency) {
            where.prices = { some: { currencyId: currency } }
        }

        // Price range filter applied to prices relation
        const price = searchParams.get('price')
        if (price) {
            const [minStr, maxStr] = price.split('-')
            const min = parseFloat(minStr || '0')
            const max = parseFloat(maxStr || '0')
            if (min && max) {
                if (where.prices) {
                    // Combine currency and price criteria
                    where.prices = { some: { currencyId: currency ?? undefined, amount: { gte: min, lte: max } } }
                } else {
                    where.prices = { some: { amount: { gte: min, lte: max } } }
                }
            }
        }

        // Fetch products with count
        const [products, totalDocs] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    categoryId: true,
                    category: true,
                    subcategory: true,
                    // pricing JSON removed - use `prices`
                    prices: {
                        include: { currency: true }
                    },
                    coverImages: true,
                    inStock: true,
                    isActive: true,
                    featured: true,
                },
            }),
            prisma.product.count({ where }),
        ])

        const totalPages = Math.ceil(totalDocs / limit)

        return NextResponse.json({
            docs: products.map((prod) => ({
                ...prod,
                prices: prod.prices?.map((p) => ({
                    ...p,
                    amount: toNumber(p.amount),
                    saleAmount: p.saleAmount == null ? null : toNumber(p.saleAmount),
                })) || [],
            })),
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
