import { router, protectedProcedure } from '../../trpc'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { productSchema, productUpdateSchema } from '@/lib/api-validators'
import { toNumber } from '@/lib/number'
import { TRPCError } from '@trpc/server'
import { ErrorCode, mapPrismaError, createErrorWithCode } from '@/lib/error-codes'

const resolveStoreId = async (storeId: string | undefined, userId: string) => {
    if (storeId) return storeId
    const store = await prisma.store.findFirst({ where: { ownerId: userId }, orderBy: { createdAt: 'asc' } })
    if (!store) {
        throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, { message: 'Store not found for this user' })
    }
    return store.id
}

export const adminProductsRouter = router({
    create: protectedProcedure.input(productSchema).mutation(async ({ input, ctx }) => {
        const payload = input
        const storeId = await resolveStoreId(payload.storeId, ctx.session.user.id)

        let resolvedSubcategoryId: string | undefined
        if (typeof payload.subcategoryId === 'string' && payload.subcategoryId.trim() !== '') {
            const subcategory = await prisma.subcategory.findFirst({ where: { OR: [{ id: payload.subcategoryId }, { slug: payload.subcategoryId }], storeId } })
            if (!subcategory) {
                throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, {
                    message: 'Subcategory not found',
                    details: { resource: 'subcategory', id: payload.subcategoryId }
                })
            }
            resolvedSubcategoryId = subcategory.id
        }

        const category = await prisma.category.findFirst({ where: { id: payload.categoryId, storeId } })
        if (!category) {
            throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, {
                message: 'Category not found for this store',
                details: { resource: 'category', id: payload.categoryId }
            })
        }

        try {
            const currencies = await prisma.currency.findMany({ where: { storeId } })
            const currencyMap = new Map(currencies.map(c => [c.code, c.id]))

            const product = await prisma.product.create({
                data: {
                    storeId,
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
                    variants: {
                        create: (payload.variants || []).map((variant: any) => ({
                            name: variant.name,
                            sku: variant.sku,
                            stock: variant.stock || 0,
                            attributes: variant.attributes || {},
                            isActive: variant.isActive ?? true,
                            image: variant.image,
                            description: variant.description,
                            shortDescription: variant.shortDescription,
                            specifications: variant.specifications || {},
                            images: {
                                create: (variant.coverImages || []).map((image: any) => ({
                                    url: image.url,
                                    alt: image.alt,
                                })),
                            },
                            prices: {
                                create: (variant.prices || []).map((p: any) => {
                                    const currencyId = currencyMap.get(p.currency)
                                    if (!currencyId) return null
                                    return {
                                        amount: p.price || 0,
                                        saleAmount: p.salePrice ?? null,
                                        currencyId,
                                        isDefault: p.isDefault ?? false,
                                        taxIncluded: p.taxIncluded ?? true,
                                        storeId,
                                    }
                                }).filter((p: any) => p !== null)
                            }
                        }))
                    }
                }
            })

            if (Array.isArray(payload.prices) && payload.prices.length > 0) {
                for (const p of payload.prices) {
                    const currencyId = currencyMap.get(p.currency)
                    if (currencyId) {
                        await prisma.price.create({
                            data: {
                                amount: p.price || 0,
                                saleAmount: p.salePrice ?? null,
                                currencyId,
                                productId: product.id,
                                isDefault: p.isDefault ?? false,
                                taxIncluded: p.taxIncluded ?? true,
                                storeId,
                            }
                        })
                    }
                }
            }

            return product
        } catch (error: any) {
            const prismaErrorCode = mapPrismaError(error)
            if (prismaErrorCode) {
                throw createErrorWithCode(prismaErrorCode)
            }

            if (error instanceof TRPCError) {
                throw error
            }

            console.error('Unexpected error in products.create:', error)
            throw createErrorWithCode(ErrorCode.SERVER_ERROR)
        }
    }),

    get: protectedProcedure.input(z.object({ id: z.string(), storeId: z.string().optional() })).query(async ({ input, ctx }) => {
        const { id } = input
        const storeId = await resolveStoreId(input.storeId, ctx.session.user.id)

        const [product, allCategories, allSubcategories, allCurrencies] = await Promise.all([
            prisma.product.findFirst({
                where: { id, storeId },
                include: {
                    coverImages: true,
                    category: { include: { subcategories: true } },
                    subcategory: true,
                    prices: { include: { currency: true } },
                    variants: { include: { prices: { include: { currency: true } }, images: true } }
                }
            }),
            prisma.category.findMany({
                where: { storeId },
                orderBy: { name: 'asc' }
            }),
            prisma.subcategory.findMany({
                where: { storeId },
                orderBy: { name: 'asc' }
            }),
            prisma.currency.findMany({
                where: { storeId },
                orderBy: { code: 'asc' }
            })
        ])

        if (!product) {
            throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, {
                message: 'Product not found for this store',
                details: { resource: 'product', id }
            })
        }

        return {
            product: {
                ...product,
                prices: product.prices?.map((p) => ({
                    ...p,
                    amount: toNumber(p.amount),
                    saleAmount: p.saleAmount == null ? null : toNumber(p.saleAmount),
                })) || [],
                variants: product.variants?.map((v) => ({
                    ...v,
                    prices: v.prices?.map((p) => ({
                        ...p,
                        amount: toNumber(p.amount),
                        saleAmount: p.saleAmount == null ? null : toNumber(p.saleAmount),
                    })) || []
                })) || []
            },
            categories: allCategories,
            subcategories: allSubcategories,
            currencies: allCurrencies
        }
    }),

    update: protectedProcedure.input(z.object({ id: z.string(), storeId: z.string().optional(), data: productUpdateSchema })).mutation(async ({ input, ctx }) => {
        const { id, data } = input
        const storeId = await resolveStoreId(input.storeId ?? data.storeId, ctx.session.user.id)

        let resolvedSubcategoryId: string | undefined
        if (typeof data.subcategoryId === 'string' && data.subcategoryId.trim() !== '') {
            const subcategory = await prisma.subcategory.findFirst({ where: { OR: [{ id: data.subcategoryId }, { slug: data.subcategoryId }], storeId } })
            if (!subcategory) {
                throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, {
                    message: 'Subcategory not found',
                    details: { resource: 'subcategory', id: data.subcategoryId }
                })
            }
            resolvedSubcategoryId = subcategory.id
        }

        const category = await prisma.category.findFirst({ where: { id: data.categoryId, storeId } })
        if (!category) {
            throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, {
                message: 'Category not found for this store',
                details: { resource: 'category', id: data.categoryId }
            })
        }

        const { coverImages, prices, variants, storeId: _ignoredStoreId, ...restOfData } = data

        const currencies = await prisma.currency.findMany({ where: { storeId } })
        const currencyMap = new Map(currencies.map(c => [c.code, c.id]))

        try {
            const existingProduct = await prisma.product.findFirst({ where: { id, storeId } })
            if (!existingProduct) {
                throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, {
                    message: 'Product not found for this store',
                    details: { resource: 'product', id }
                })
            }

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

            if (Array.isArray(prices)) {
                await prisma.price.deleteMany({ where: { productId: id } })
                for (const p of prices) {
                    const currencyId = currencyMap.get(p.currency)
                    if (currencyId) {
                        await prisma.price.create({
                            data: {
                                amount: p.price || 0,
                                saleAmount: p.salePrice ?? null,
                                currencyId,
                                productId: id,
                                isDefault: p.isDefault ?? false,
                                taxIncluded: p.taxIncluded ?? true,
                                storeId,
                            }
                        })
                    }
                }
            }

            if (Array.isArray(variants)) {
                const existingVariants = await prisma.productVariant.findMany({ where: { productId: id } })
                const existingVariantIds = new Set(existingVariants.map(v => v.id))

                const inputVariantIds = new Set(variants.map(v => v.id).filter(Boolean))
                const variantsToDelete = existingVariants.filter(v => !inputVariantIds.has(v.id))

                if (variantsToDelete.length > 0) {
                    await prisma.productVariant.deleteMany({
                        where: { id: { in: variantsToDelete.map(v => v.id) } }
                    })
                }

                for (const v of variants) {
                    let variantId = v.id

                    if (variantId && existingVariantIds.has(variantId)) {
                        await prisma.productVariant.update({
                            where: { id: variantId },
                            data: {
                                name: v.name,
                                sku: v.sku,
                                stock: v.stock,
                                attributes: v.attributes,
                                isActive: v.isActive,
                                image: v.image,
                                description: v.description,
                                shortDescription: v.shortDescription,
                                specifications: v.specifications,
                            }
                        })
                    } else {
                        const newVariant = await prisma.productVariant.create({
                            data: {
                                productId: id,
                                name: v.name,
                                sku: v.sku,
                                stock: v.stock || 0,
                                attributes: v.attributes || {},
                                isActive: v.isActive ?? true,
                                image: v.image,
                                description: v.description,
                                shortDescription: v.shortDescription,
                                specifications: v.specifications || {},
                            }
                        })
                        variantId = newVariant.id
                    }

                    if (v.coverImages) {
                        await prisma.media.deleteMany({ where: { productVariantId: variantId } })
                        if (v.coverImages.length > 0) {
                            await prisma.media.createMany({
                                data: v.coverImages.map((image: any) => ({
                                    url: image.url,
                                    alt: image.alt,
                                    productVariantId: variantId,
                                })),
                            })
                        }
                    }

                    if (v.prices && Array.isArray(v.prices)) {
                        await prisma.price.deleteMany({ where: { productVariantId: variantId } })
                        for (const p of v.prices) {
                            const currencyId = currencyMap.get(p.currency)
                            if (currencyId) {
                                await prisma.price.create({
                                    data: {
                                        amount: p.price || 0,
                                        saleAmount: p.salePrice ?? null,
                                        currencyId,
                                        productVariantId: variantId,
                                        isDefault: p.isDefault ?? false,
                                        taxIncluded: p.taxIncluded ?? true,
                                        storeId,
                                    }
                                })
                            }
                        }
                    }
                }
            }

            return product
        } catch (error: any) {
            const prismaErrorCode = mapPrismaError(error)
            if (prismaErrorCode) {
                throw createErrorWithCode(prismaErrorCode)
            }

            if (error instanceof TRPCError) {
                throw error
            }

            console.error('Unexpected error in products.update:', error)
            throw createErrorWithCode(ErrorCode.SERVER_ERROR)
        }
    }),

    delete: protectedProcedure.input(z.object({ id: z.string(), storeId: z.string().optional() })).mutation(async ({ input, ctx }) => {
        const storeId = await resolveStoreId(input.storeId, ctx.session.user.id)
        const existing = await prisma.product.findFirst({ where: { id: input.id, storeId } })
        if (!existing) {
            throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, { message: 'Product not found for this store' })
        }
        await prisma.product.delete({ where: { id: input.id } })
        return { success: true }
    }),
})
