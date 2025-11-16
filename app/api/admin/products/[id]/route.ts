import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { toNumber } from '@/lib/number'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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
    try {
        const { id } = await params
        const data = await request.json()

        const product = await prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
                shortDescription: data.shortDescription,
                categoryId: data.categoryId,
                subcategoryId: data.subcategoryId,
                coverImages: data.coverImages,
                // pricing removed - use prices relation
                specifications: data.specifications,
                filterValues: data.filterValues,
                tags: data.tags,
                metaData: data.metaData,
                isActive: data.isActive,
                inStock: data.inStock,
                featured: data.featured,
                // Keep `pricing` available for legacy DBs that still have the JSON column
                // Provide a no-op object to avoid failing updates at runtime while migrating.
                // @ts-ignore - `pricing` may have been removed from the Prisma client types
                pricing: data.pricing ?? {},
            },
        })

        // Update prices (simple approach: remove existing and create new if provided)
        if (Array.isArray(data.prices) && data.prices.length > 0) {
            await prisma.price.deleteMany({ where: { productId: id } })

            for (const p of data.prices) {
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
