import { router, publicProcedure } from '../trpc'
import { z } from 'zod'
import { prisma } from '@/lib/db'

export const categoriesRouter = router({
    list: publicProcedure
        .input(
            z.object({ slug: z.string().optional() }).optional()
        )
        .query(async ({ input }) => {
            const slug = input?.slug

            const where: any = { isActive: true }
            if (slug) where.slug = slug

            if (slug) {
                const category = await prisma.category.findFirst({ where })
                return {
                    docs: category ? [category] : [],
                    totalDocs: category ? 1 : 0,
                }
            }

            const categories = await prisma.category.findMany({ where, orderBy: { name: 'asc' } })

            return {
                docs: categories,
                totalDocs: categories.length,
            }
        }),
})
