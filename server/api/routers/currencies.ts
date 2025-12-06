import { router, publicProcedure } from '../trpc'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const currenciesRouter = router({
    list: publicProcedure
        .input(z.object({ storeSlug: z.string() }))
        .query(async ({ input }) => {
            const store = await prisma.store.findUnique({ where: { slug: input.storeSlug } })
            if (!store) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Store not found' })
            }

            const currencies = await prisma.currency.findMany({ where: { isActive: true, storeId: store.id }, orderBy: { code: 'asc' } })
            return currencies
        }),
})
