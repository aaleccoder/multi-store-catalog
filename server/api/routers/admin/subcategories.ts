import { router, protectedProcedure } from '../../trpc'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { subcategorySchema, subcategoryUpdateSchema } from '@/lib/api-validators'

export const adminSubcategoriesRouter = router({
    list: protectedProcedure.query(async () => {
        const subcategories = await prisma.subcategory.findMany({
            include: { category: true, _count: { select: { products: true } } },
            orderBy: { name: 'asc' },
        })
        return subcategories
    }),

    create: protectedProcedure.input(subcategorySchema).mutation(async ({ input }) => {
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
    }),

    update: protectedProcedure
        .input(z.object({ id: z.string(), data: subcategoryUpdateSchema }))
        .mutation(async ({ input }) => {
            const { id, data } = input
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
        }),

    delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
        await prisma.subcategory.delete({ where: { id: input } })
        return { success: true }
    }),
})
