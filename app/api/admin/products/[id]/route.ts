import { NextRequest, NextResponse } from 'next/server'
import { requireApiAuth } from '@/lib/session'
import { prisma } from '@/lib/db'
import { productUpdateSchema } from '@/lib/api-validators'
import { toNumber } from '@/lib/number'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireApiAuth(request)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
        const { id } = await params

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                subcategory: true,
                prices: { include: { currency: true } },
            },
        })

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        // Convert Decimal to numbers for client-side use
        const sanitized = {
            ...product,
            prices: product?.prices?.map((p) => ({
                ...p,
                amount: toNumber(p.amount),
                saleAmount: p.saleAmount == null ? null : toNumber(p.saleAmount),
            })) || [],
        }

        return NextResponse.json(sanitized)
    } catch (error) {
        console.error('Error fetching product:', error)
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireApiAuth(request)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
        const { id } = await params
        const data = await request.json()
        const parsed = productUpdateSchema.safeParse(data)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
        }

        const payload = parsed.data

        // Resolve subcategory the same way as create
        let resolvedSubcategoryId: string | undefined = undefined
        if (typeof payload.subcategoryId === 'string' && payload.subcategoryId.trim() !== '') {
            const subcategory = await prisma.subcategory.findFirst({
                where: { OR: [{ id: payload.subcategoryId }, { slug: payload.subcategoryId }] },
            })
            if (!subcategory) {
                return NextResponse.json({ error: 'Subcategory not found' }, { status: 400 })
            }
            resolvedSubcategoryId = subcategory.id
        }

        const product = await prisma.product.update({
            where: { id },
            data: {
                name: payload.name,
                slug: payload.slug,
                description: payload.description,
                shortDescription: payload.shortDescription,
                categoryId: payload.categoryId,
                subcategoryId: resolvedSubcategoryId,
                coverImages: payload.coverImages,
                specifications: payload.specifications,
                filterValues: payload.filterValues,
                tags: payload.tags,
                metaData: payload.metaData,
                isActive: payload.isActive,
                inStock: payload.inStock,
                featured: payload.featured,
            },
        })

        // Update prices (simple approach: remove existing and create new if provided)
        if (Array.isArray(payload.prices) && payload.prices.length > 0) {
            await prisma.price.deleteMany({ where: { productId: id } })

            for (const p of payload.prices) {
                const currency = await prisma.currency.findFirst({ where: { code: p.currency } })
                if (currency) {
                    await prisma.price.create({
                        data: {
                            amount: p.price || 0,
                            saleAmount: p.salePrice ?? null,
                            currencyId: currency.id,
                            productId: id,
                            isDefault: p.isDefault ?? false,
                            taxIncluded: p.taxIncluded ?? true,
                        },
                    })
                }
            }
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error('Error updating product:', error)
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireApiAuth(request)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
        const { id } = await params

        await prisma.product.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting product:', error)
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        )
    }
}
