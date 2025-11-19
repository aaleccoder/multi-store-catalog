import { router, protectedProcedure } from '../../trpc'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { categorySchema, categoryUpdateSchema } from '@/lib/api-validators'

export const adminCategoriesRouter = router({
    list: protectedProcedure.query(async () => {
        const categories = await prisma.category.findMany({
            include: { _count: { select: { products: true } } },
            orderBy: { name: 'asc' },
        })
        return categories
    }),

    create: protectedProcedure.input(categorySchema).mutation(async ({ input }) => {
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
    }),

    update: protectedProcedure
        .input(z.object({ id: z.string(), data: categoryUpdateSchema }))
        .mutation(async ({ input }) => {
            const { id, data } = input
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
        }),

    delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
        await prisma.category.delete({ where: { id: input } })
        return { success: true }
    }),
})
