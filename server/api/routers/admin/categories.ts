import { router, protectedProcedure } from '../../trpc'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { categorySchema, categoryUpdateSchema } from '@/lib/api-validators'
import { TRPCError } from '@trpc/server'

export const adminCategoriesRouter = router({
    list: protectedProcedure.query(async () => {
        const categories = await prisma.category.findMany({
            include: { _count: { select: { products: true } } },
            orderBy: { name: 'asc' },
        })
        return categories
    }),

    create: protectedProcedure.input(categorySchema).mutation(async ({ input }) => {
        try {
            const category = await prisma.category.create({
                data: {
                    name: input.name,
                    slug: input.slug,
                    description: input.description,
                    icon: input.icon,
                    isActive: input.isActive ?? true,
                    filters: input.filters || [],
                }
            })
            return category
        } catch (error: any) {
            // Check if it's a unique constraint error (duplicate slug)
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
        .input(z.object({ id: z.string(), data: categoryUpdateSchema }))
        .mutation(async ({ input }) => {
            const { id, data } = input
            try {
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
                // Check if it's a unique constraint error (duplicate slug)
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
            await prisma.category.delete({ where: { id: input } })
            return { success: true }
        } catch (error: any) {
            // Check if it's a foreign key constraint error
            if (error.code === 'P2003' || error.message?.includes('Foreign key constraint')) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'No se puede eliminar esta categoría porque tiene productos asociados'
                })
            }
            throw error
        }
    }),
})
