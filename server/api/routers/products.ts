import { router, publicProcedure } from '../trpc'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { toNumber } from '@/lib/number'

export const productsRouter = router({
    list: publicProcedure
        .input(
            z.object({
                page: z.string().optional(),
                limit: z.string().optional(),
                sort: z.string().optional(),
                category: z.string().optional(),
                subcategory: z.string().optional(),
                inStock: z.string().optional(),
                featured: z.string().optional(),
                search: z.string().optional(),
                currency: z.string().optional(),
                price: z.string().optional().nullable(),
            }).optional()
        )
        .query(async ({ input }) => {
            try {
                const searchParams = input ?? {}

                const page = parseInt(searchParams.page ?? '1')
                const limit = parseInt(searchParams.limit ?? '12')
                const skip = (page - 1) * limit

                const sort = searchParams.sort ?? '-createdAt'
                let orderBy: any = {}

                if (sort === '-createdAt') orderBy = { id: 'desc' }
                else if (sort === 'createdAt') orderBy = { id: 'asc' }
                else if (sort === 'name') orderBy = { name: 'asc' }
                else if (sort === '-name') orderBy = { name: 'desc' }
                else if (sort === 'price') orderBy = { prices: { _min: { amount: 'asc' } } }
                else if (sort === '-price') orderBy = { prices: { _max: { amount: 'desc' } } }

                const where: any = { isActive: true }

                if (searchParams.category) where.categoryId = searchParams.category
                if (searchParams.subcategory) where.subcategoryId = searchParams.subcategory
                if (searchParams.inStock === 'true') where.inStock = true
                if (searchParams.featured === 'true') where.featured = true

                const search = searchParams.search
                if (search) {
                    where.OR = [
                        { name: { contains: search, mode: 'insensitive' } },
                        { shortDescription: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                    ]
                }

                const currency = searchParams.currency
                if (currency) where.prices = { some: { currencyId: currency } }

                const price = searchParams.price
                if (price) {
                    const [minStr, maxStr] = price.split('-')
                    const min = minStr !== '' ? parseFloat(minStr) : undefined
                    const max = maxStr !== '' ? parseFloat(maxStr) : undefined
                    const priceWhere: any = {}
                    if (min !== undefined && !isNaN(min)) priceWhere.amount = { ...(priceWhere.amount ?? {}), gte: min }
                    if (max !== undefined && !isNaN(max)) priceWhere.amount = { ...(priceWhere.amount ?? {}), lte: max }

                    if (Object.keys(priceWhere).length > 0) {
                        if (where.prices) {
                            where.prices = { some: { currencyId: currency ?? undefined, ...priceWhere } }
                        } else {
                            where.prices = { some: { ...priceWhere } }
                        }
                    }
                }

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
                            category: {
                                select: {
                                    name: true,
                                    slug: true
                                }
                            },
                            subcategory: {
                                select: {
                                    name: true,
                                    slug: true
                                }
                            },
                            prices: { include: { currency: true } },
                            coverImages: {
                                select: {
                                    id: true,
                                    url: true,
                                    alt: true,
                                }
                            },
                            inStock: true,
                            isActive: true,
                            featured: true,
                        },
                    }),
                    prisma.product.count({ where }),
                ])

                const totalPages = Math.ceil(totalDocs / limit)

                return {
                    docs: products.map((prod) => ({
                        ...prod,
                        prices: prod.prices?.map((p) => ({
                            ...p,
                            amount: toNumber(p.amount),
                            saleAmount: p.saleAmount == null ? null : toNumber(p.saleAmount),
                        })) || [],
                    })),
                    totalDocs,
                    page,
                    limit,
                    totalPages,
                    pagingCounter: skip + 1,
                    hasPrevPage: page > 1,
                    hasNextPage: page < totalPages,
                    prevPage: page > 1 ? page - 1 : null,
                    nextPage: page < totalPages ? page + 1 : null,
                }
            } catch (error) {
                console.log('Error in products list query:', error)
                throw error
            }
        }),
})
