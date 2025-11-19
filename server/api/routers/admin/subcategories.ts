import { router, protectedProcedure } from '../../trpc'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { subcategorySchema, subcategoryUpdateSchema } from '@/lib/api-validators'
import { TRPCError } from '@trpc/server'
import { ErrorCode, mapPrismaError, createErrorWithCode } from '@/lib/error-codes'

export const adminSubcategoriesRouter = router({
    list: protectedProcedure.query(async () => {
        const subcategories = await prisma.subcategory.findMany({
            include: { category: true, _count: { select: { products: true } } },
            orderBy: { name: 'asc' },
        })
        return subcategories
    }),

    create: protectedProcedure.input(subcategorySchema).mutation(async ({ input }) => {
        try {
            const subcategory = await prisma.subcategory.create({
                data: {
                    name: input.name,
                    slug: input.slug,
                    description: input.description,
                    categoryId: input.categoryId,
                    isActive: input.isActive ?? true,
                    filters: input.filters || [],
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
        .input(z.object({ id: z.string(), data: subcategoryUpdateSchema }))
        .mutation(async ({ input }) => {
            const { id, data } = input
            try {
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

    delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
        try {
            await prisma.subcategory.delete({ where: { id: input } })
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
