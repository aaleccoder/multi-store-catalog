import { router, protectedProcedure } from '../../trpc'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { subcategorySchema, subcategoryUpdateSchema } from '@/lib/api-validators'
import { TRPCError } from '@trpc/server'

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
            if (error.code === 'P2002') {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'El slug ya está en uso. Por favor, elige un slug diferente.'
                })
            }
            throw error
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
                if (error.code === 'P2002') {
                    throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message: 'El slug ya está en uso. Por favor, elige un slug diferente.'
                    })
                }
                throw error
            }
        }),

    delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
        try {
            await prisma.subcategory.delete({ where: { id: input } })
            return { success: true }
        } catch (error: any) {
            if (error.code === 'P2003' || error.message?.includes('Foreign key constraint')) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'No se puede eliminar esta subcategoría porque tiene productos asociados'
                })
            }
            throw error
        }
    }),
})
