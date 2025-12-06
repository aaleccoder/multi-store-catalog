import { router, publicProcedure } from '../trpc'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { TRPCError } from '@trpc/server'

export const subcategoriesRouter = router({
    list: publicProcedure
        .input(
            z.object({ storeSlug: z.string(), slug: z.string().optional(), categoryId: z.string().optional() })
        )
        .query(async ({ input }) => {
            if (!input) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'storeSlug is required' })
            }

            const { storeSlug, slug, categoryId } = input

            const store = await prisma.store.findUnique({ where: { slug: storeSlug } })
            if (!store) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' })
            }

            const where: any = { isActive: true, storeId: store.id }

            if (slug) where.slug = slug
            if (categoryId) where.categoryId = categoryId

            if (slug) {
                const subcategory = await prisma.subcategory.findFirst({ where, include: { category: true } })
                return {
                    docs: subcategory ? [subcategory] : [],
                    totalDocs: subcategory ? 1 : 0,
                }
            }

            const subcategories = await prisma.subcategory.findMany({ where, orderBy: { name: 'asc' }, include: { category: true } })

            return {
                docs: subcategories,
                totalDocs: subcategories.length,
            }
        }),
})
