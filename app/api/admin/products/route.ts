import { NextRequest, NextResponse } from 'next/server'
import { requireApiAuth } from '@/lib/session'
import { prisma } from '@/lib/db'
import { productSchema } from '@/lib/api-validators'

export async function POST(request: NextRequest) {
    const session = await requireApiAuth(request)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
        const data = await request.json()
        const parsed = productSchema.safeParse(data)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
        }

        const payload = parsed.data

        let resolvedSubcategoryId: string | undefined = undefined
        if (typeof payload.subcategoryId === 'string' && payload.subcategoryId.trim() !== '') {
            const subcategory = await prisma.subcategory.findFirst({
                where: {
                    OR: [{ id: payload.subcategoryId }, { slug: payload.subcategoryId }],
                },
            })
            if (!subcategory) {
                return NextResponse.json(
                    { error: 'Subcategory not found' },
                    { status: 400 }
                )
            }
            resolvedSubcategoryId = subcategory.id
        }

        const product = await prisma.product.create({
            data: {
                name: payload.name,
                slug: payload.slug,
                description: payload.description,
                shortDescription: payload.shortDescription,
                categoryId: payload.categoryId,
                subcategoryId: resolvedSubcategoryId,
                coverImages: payload.coverImages || [],
                specifications: payload.specifications || {},
                filterValues: payload.filterValues || [],
                tags: payload.tags || [],
                metaData: payload.metaData || {},
                isActive: payload.isActive ?? true,
                inStock: payload.inStock ?? true,
                featured: payload.featured ?? false,
            },
        })

        if (Array.isArray(payload.prices) && payload.prices.length > 0) {
            for (const p of payload.prices) {
                const currency = await prisma.currency.findFirst({ where: { code: p.currency } })
                if (currency) {
                    await prisma.price.create({
                        data: {
                            amount: p.price || 0,
                            saleAmount: p.salePrice ?? null,
                            currencyId: currency.id,
                            productId: product.id,
                            isDefault: p.isDefault ?? false,
                            taxIncluded: p.taxIncluded ?? true,
                        },
                    })
                }
            }
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error('Error creating product:', error)
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        )
    }
}
