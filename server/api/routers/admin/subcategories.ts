import { router, protectedProcedure } from '../../trpc'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { subcategorySchema, subcategoryUpdateSchema } from '@/lib/api-validators'
import { TRPCError } from '@trpc/server'
import { ErrorCode, mapPrismaError, createErrorWithCode } from '@/lib/error-codes'

const getStoreIdFromSlug = async (slug: string, userId: string) => {
    const store = await prisma.store.findFirst({ where: { slug, ownerId: userId } })
    if (!store) {
        throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, { message: 'Store not found for this user' })
    }
    return store.id
}

const resolveStoreId = async (storeId: string | undefined, storeSlug: string | undefined, userId: string, activeStoreId?: string) => {
    if (storeId) return storeId
    if (storeSlug) return await getStoreIdFromSlug(storeSlug, userId)
    if (activeStoreId) {
        // Verify the active store belongs to the user
        const store = await prisma.store.findFirst({
            where: { id: activeStoreId, ownerId: userId }
        })
        if (store) return store.id
    }
    const store = await prisma.store.findFirst({ where: { ownerId: userId }, orderBy: { createdAt: 'asc' } })
    if (!store) {
        throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, { message: 'Store not found for this user' })
    }
    return store.id
}

const ensureCategoryInStore = async (categoryId: string, storeId: string) => {
    const category = await prisma.category.findFirst({ where: { id: categoryId, storeId } })
    if (!category) {
        throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, { message: 'Category not found for this store' })
    }
    return category
}

export const adminSubcategoriesRouter = router({
    list: protectedProcedure
        .input(z.object({ storeId: z.string().optional(), storeSlug: z.string().optional(), categoryId: z.string().optional() }).optional())
        .query(async ({ input, ctx }) => {
            const storeId = await resolveStoreId(input?.storeId, input?.storeSlug, ctx.session.user.id)
            const where: any = { storeId }
            if (input?.categoryId) {
                where.categoryId = input.categoryId
            }
            const subcategories = await prisma.subcategory.findMany({
                where,
                include: { category: true, _count: { select: { products: true } } },
                orderBy: { name: 'asc' },
            })
            return subcategories
        }),

    create: protectedProcedure.input(subcategorySchema).mutation(async ({ input, ctx }) => {
        try {
            const storeId = await resolveStoreId(input?.storeId, input?.storeSlug, ctx.session.user.id, ctx.activeStoreId)
            await ensureCategoryInStore(input.categoryId, storeId)
            const subcategory = await prisma.subcategory.create({
                data: {
                    name: input.name,
                    slug: input.slug,
                    description: input.description,
                    categoryId: input.categoryId,
                    isActive: input.isActive ?? true,
                    filters: input.filters || [],
                    storeId,
                }
            })
            return subcategory
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
            console.error('Unexpected error in subcategories.create:', error)
            throw createErrorWithCode(ErrorCode.SERVER_ERROR)
        }
    }),

    update: protectedProcedure
        .input(z.object({ id: z.string(), storeId: z.string().optional(), storeSlug: z.string().optional(), data: subcategoryUpdateSchema }))
        .mutation(async ({ input, ctx }) => {
            const { id, data } = input
            try {
                const storeId = await resolveStoreId(input.storeId ?? data.storeId, input.storeSlug ?? data.storeSlug, ctx.session.user.id, ctx.activeStoreId)
                const existing = await prisma.subcategory.findFirst({ where: { id, storeId } })
                if (!existing) {
                    throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, { message: 'Subcategory not found for this store' })
                }

                if (data.categoryId) {
                    await ensureCategoryInStore(data.categoryId, storeId)
                }

                const subcategory = await prisma.subcategory.update({
                    where: { id }, data: {
                        name: data.name,
                        slug: data.slug,
                        description: data.description,
                        categoryId: data.categoryId,
                        isActive: data.isActive,
                        filters: data.filters,
                    }
                })
                return subcategory
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
                console.error('Unexpected error in subcategories.update:', error)
                throw createErrorWithCode(ErrorCode.SERVER_ERROR)
            }
        }),

    delete: protectedProcedure.input(z.object({ id: z.string(), storeId: z.string().optional(), storeSlug: z.string().optional() })).mutation(async ({ input, ctx }) => {
        try {
            const storeId = await resolveStoreId(input?.storeId, input?.storeSlug, ctx.session.user.id, ctx.activeStoreId)
            const existing = await prisma.subcategory.findFirst({ where: { id: input.id, storeId } })
            if (!existing) {
                throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, { message: 'Subcategory not found for this store' })
            }

            await prisma.subcategory.delete({ where: { id: input.id } })
            return { success: true }
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
            console.error('Unexpected error in subcategories.delete:', error)
            throw createErrorWithCode(ErrorCode.SERVER_ERROR)
        }
    }),
})
