import { router, protectedProcedure } from '../../trpc'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { categorySchema, categoryUpdateSchema } from '@/lib/api-validators'
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

export const adminCategoriesRouter = router({
    list: protectedProcedure
        .input(z.object({ storeId: z.string().optional() }).optional())
        .query(async ({ input, ctx }) => {
            const storeId = await resolveStoreId(input?.storeId, ctx.session.user.id)
            const categories = await prisma.category.findMany({
                where: { storeId },
                include: { _count: { select: { products: true } } },
                orderBy: { name: 'asc' },
            })
            return categories
        }),

    create: protectedProcedure.input(categorySchema).mutation(async ({ input, ctx }) => {
        try {
            const storeId = await resolveStoreId(input.storeId, ctx.session.user.id)
            const category = await prisma.category.create({
                data: {
                    name: input.name,
                    slug: input.slug,
                    description: input.description,
                    icon: input.icon,
                    isActive: input.isActive ?? true,
                    filters: input.filters || [],
                    storeId,
                }
            })
            return category
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
            console.error('Unexpected error in categories.create:', error)
            throw createErrorWithCode(ErrorCode.SERVER_ERROR)
        }
    }),

    update: protectedProcedure
        .input(z.object({ id: z.string(), storeId: z.string().optional(), data: categoryUpdateSchema }))
        .mutation(async ({ input, ctx }) => {
            const { id, data } = input
            try {
                const storeId = await resolveStoreId(input.storeId ?? data.storeId, ctx.session.user.id)
                const existing = await prisma.category.findFirst({ where: { id, storeId } })
                if (!existing) {
                    throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, { message: 'Category not found for this store' })
                }

                const category = await prisma.category.update({
                    where: { id }, data: {
                        name: data.name,
                        slug: data.slug,
                        description: data.description,
                        icon: data.icon,
                        isActive: data.isActive,
                        filters: data.filters,
                    }
                })
                return category
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
                console.error('Unexpected error in categories.update:', error)
                throw createErrorWithCode(ErrorCode.SERVER_ERROR)
            }
        }),

    delete: protectedProcedure.input(z.object({ id: z.string(), storeId: z.string().optional() })).mutation(async ({ input, ctx }) => {
        try {
            const storeId = await resolveStoreId(input.storeId, ctx.session.user.id)
            const existing = await prisma.category.findFirst({ where: { id: input.id, storeId } })
            if (!existing) {
                throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, { message: 'Category not found for this store' })
            }

            await prisma.category.delete({ where: { id: input.id } })
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
            console.error('Unexpected error in categories.delete:', error)
            throw createErrorWithCode(ErrorCode.SERVER_ERROR)
        }
    }),
})
