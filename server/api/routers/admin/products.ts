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
            // Pre-fetch currencies for price mapping
            const currencies = await prisma.currency.findMany()
            const currencyMap = new Map(currencies.map(c => [c.code, c.id]))

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
                                    if (!currencyId) return null // Skip if currency not found
                                    return {
                                        amount: p.price || 0,
                                        saleAmount: p.salePrice ?? null,
                                        currencyId: currencyId,
                                        isDefault: p.isDefault ?? false,
                                        taxIncluded: p.taxIncluded ?? true,
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
                                currencyId: currencyId,
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

        const [product, allCategories, allSubcategories, allCurrencies] = await Promise.all([
            prisma.product.findUnique({
                where: { id },
                include: {
                    coverImages: true,
                    category: { include: { subcategories: true } },
                    subcategory: true,
                    prices: { include: { currency: true } },
                    variants: { include: { prices: { include: { currency: true } }, images: true } }
                }
            }),
            prisma.category.findMany({
                orderBy: { name: 'asc' }
            }),
            prisma.subcategory.findMany({
                orderBy: { name: 'asc' }
            }),
            prisma.currency.findMany({
                orderBy: { code: 'asc' }
            })
        ])

        if (!product) {
            throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, {
                message: 'Product not found',
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

        const { coverImages, prices, variants, ...restOfData } = data

        // Pre-fetch currencies
        const currencies = await prisma.currency.findMany()
        const currencyMap = new Map(currencies.map(c => [c.code, c.id]))

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

            if (Array.isArray(prices)) { // Only update prices if provided
                await prisma.price.deleteMany({ where: { productId: id } })
                for (const p of prices) {
                    const currencyId = currencyMap.get(p.currency)
                    if (currencyId) {
                        await prisma.price.create({
                            data: {
                                amount: p.price || 0,
                                saleAmount: p.salePrice ?? null,
                                currencyId: currencyId,
                                productId: id,
                                isDefault: p.isDefault ?? false,
                                taxIncluded: p.taxIncluded ?? true,
                            }
                        })
                    }
                }
            }

            if (Array.isArray(variants)) {
                // 1. Get existing variants
                const existingVariants = await prisma.productVariant.findMany({ where: { productId: id } })
                const existingVariantIds = new Set(existingVariants.map(v => v.id))

                // 2. Identify variants to delete (in DB but not in input)
                const inputVariantIds = new Set(variants.map(v => v.id).filter(Boolean))
                const variantsToDelete = existingVariants.filter(v => !inputVariantIds.has(v.id))

                if (variantsToDelete.length > 0) {
                    await prisma.productVariant.deleteMany({
                        where: { id: { in: variantsToDelete.map(v => v.id) } }
                    })
                }

                // 3. Upsert variants (Create or Update)
                for (const v of variants) {
                    let variantId = v.id

                    if (variantId && existingVariantIds.has(variantId)) {
                        // Update existing
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
                        // Create new
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

                    // Update images for this variant
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

                    // 4. Update prices for this variant
                    if (v.prices && Array.isArray(v.prices)) {
                        await prisma.price.deleteMany({ where: { productVariantId: variantId } })
                        for (const p of v.prices) {
                            const currencyId = currencyMap.get(p.currency)
                            if (currencyId) {
                                await prisma.price.create({
                                    data: {
                                        amount: p.price || 0,
                                        saleAmount: p.salePrice ?? null,
                                        currencyId: currencyId,
                                        productVariantId: variantId,
                                        isDefault: p.isDefault ?? false,
                                        taxIncluded: p.taxIncluded ?? true,
                                    }
                                })
                            }
                        }
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
