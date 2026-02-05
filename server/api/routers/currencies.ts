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

            const storeCurrencies = await prisma.storeCurrency.findMany({
                where: {
                    storeId: store.id,
                    isEnabled: true,
                    currency: { isActive: true },
                },
                include: { currency: true },
                orderBy: { currency: { code: 'asc' } },
            })

            return storeCurrencies.map((item) => item.currency)
        }),
})
