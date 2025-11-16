import { router, protectedProcedure } from '../../trpc'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { productSchema, productUpdateSchema } from '@/lib/api-validators'
import { toNumber } from '@/lib/number'

export const adminProductsRouter = router({
    create: protectedProcedure.input(productSchema).mutation(async ({ input }) => {
        const payload = input

        let resolvedSubcategoryId: string | undefined
        if (typeof payload.subcategoryId === 'string' && payload.subcategoryId.trim() !== '') {
            const subcategory = await prisma.subcategory.findFirst({ where: { OR: [{ id: payload.subcategoryId }, { slug: payload.subcategoryId }] } })
            if (!subcategory) throw new Error('Subcategory not found')
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
                coverImages: {
                    create: (payload.coverImages || []).map((image: any) => ({
                        url: image.url,
                        alt: image.alt,
                    })),
                },
                specifications: payload.specifications || {},
                filterValues: payload.filterValues || [],
                tags: payload.tags || [],
                metaData: payload.metaData || {},
                isActive: payload.isActive ?? true,
                inStock: payload.inStock ?? true,
                featured: payload.featured ?? false,
            }
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
                        }
                    })
                }
            }
        }

        return product
    }),

    get: protectedProcedure.input(z.string()).query(async ({ input }) => {
        const id = input
        const product = await prisma.product.findUnique({ where: { id }, include: { coverImages: true, category: true, subcategory: true, prices: { include: { currency: true } } } })
        if (!product) throw new Error('Product not found')

        return {
            ...product,
            prices: product.prices?.map((p) => ({
                ...p,
                amount: toNumber(p.amount),
                saleAmount: p.saleAmount == null ? null : toNumber(p.saleAmount),
            })) || [],
        }
    }),

    update: protectedProcedure.input(z.object({ id: z.string(), data: productUpdateSchema })).mutation(async ({ input }) => {
        const { id, data } = input

        let resolvedSubcategoryId: string | undefined
        if (typeof data.subcategoryId === 'string' && data.subcategoryId.trim() !== '') {
            const subcategory = await prisma.subcategory.findFirst({ where: { OR: [{ id: data.subcategoryId }, { slug: data.subcategoryId }] } })
            if (!subcategory) throw new Error('Subcategory not found')
            resolvedSubcategoryId = subcategory.id
        }

        const { coverImages, prices, ...restOfData } = data

        const product = await prisma.product.update({
            where: { id },
            data: {
                ...restOfData,
                subcategoryId: resolvedSubcategoryId,
            }
        })

        if (coverImages) {
            await prisma.media.deleteMany({ where: { productId: id } })
            if (coverImages.length > 0) {
                await prisma.media.createMany({
                    data: coverImages.map((image: any) => ({
                        url: image.url,
                        alt: image.alt,
                        productId: id,
                    })),
                })
            }
        }

        if (Array.isArray(prices) && prices.length > 0) {
            await prisma.price.deleteMany({ where: { productId: id } })
            for (const p of prices) {
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
                        }
                    })
                }
            }
        }

        return product
    }),

    delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
        await prisma.product.delete({ where: { id: input } })
        return { success: true }
    }),
})
