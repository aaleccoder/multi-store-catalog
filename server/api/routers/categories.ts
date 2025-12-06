import { router, publicProcedure } from '../trpc'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { TRPCError } from '@trpc/server'

export const categoriesRouter = router({
    list: publicProcedure
        .input(
            z.object({ storeSlug: z.string(), slug: z.string().optional() })
        )
        .query(async ({ input }) => {
            if (!input) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'storeSlug is required' })
            }

            const { storeSlug, slug } = input

            const store = await prisma.store.findUnique({ where: { slug: storeSlug } })
            if (!store) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' })
            }

            const where: any = { isActive: true, storeId: store.id }
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
