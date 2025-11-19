import { router, protectedProcedure } from '../../trpc'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { productSchema, productUpdateSchema } from '@/lib/api-validators'
import { toNumber } from '@/lib/number'
import { TRPCError } from '@trpc/server'
import { ErrorCode, mapPrismaError, createErrorWithCode } from '@/lib/error-codes'

export const adminProductsRouter = router({
    create: protectedProcedure.input(productSchema).mutation(async ({ input }) => {
        const payload = input

        let resolvedSubcategoryId: string | undefined
        if (typeof payload.subcategoryId === 'string' && payload.subcategoryId.trim() !== '') {
            const subcategory = await prisma.subcategory.findFirst({ where: { OR: [{ id: payload.subcategoryId }, { slug: payload.subcategoryId }] } })
            if (!subcategory) {
                throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, {
                    message: 'Subcategory not found',
                    details: { resource: 'subcategory', id: payload.subcategoryId }
                })
            }
            resolvedSubcategoryId = subcategory.id
        }

        try {
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
        } catch (error: any) {
            // Check for Prisma errors and map to standardized codes
            const prismaErrorCode = mapPrismaError(error)
            if (prismaErrorCode) {
                throw createErrorWithCode(prismaErrorCode)
            }

            // If already a TRPCError (one we created), rethrow
            if (error instanceof TRPCError) {
                throw error
            }

            // Handle unexpected errors
            console.error('Unexpected error in products.create:', error)
            throw createErrorWithCode(ErrorCode.SERVER_ERROR)
        }
    }),

    get: protectedProcedure.input(z.string()).query(async ({ input }) => {
        const id = input
        const product = await prisma.product.findUnique({ where: { id }, include: { coverImages: true, category: true, subcategory: true, prices: { include: { currency: true } } } })
        if (!product) {
            throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, {
                message: 'Product not found',
                details: { resource: 'product', id }
            })
        }

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
            if (!subcategory) {
                throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, {
                    message: 'Subcategory not found',
                    details: { resource: 'subcategory', id: data.subcategoryId }
                })
            }
            resolvedSubcategoryId = subcategory.id
        }

        const { coverImages, prices, ...restOfData } = data

        try {
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
        } catch (error: any) {
            // Check for Prisma errors and map to standardized codes
            const prismaErrorCode = mapPrismaError(error)
            if (prismaErrorCode) {
                throw createErrorWithCode(prismaErrorCode)
            }

            // If already a TRPCError (one we created), rethrow
            if (error instanceof TRPCError) {
                throw error
            }

            // Handle unexpected errors
            console.error('Unexpected error in products.update:', error)
            throw createErrorWithCode(ErrorCode.SERVER_ERROR)
        }
    }),

    delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
        await prisma.product.delete({ where: { id: input } })
        return { success: true }
    }),
})
