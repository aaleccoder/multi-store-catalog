import { router, publicProcedure } from '../trpc'
import { prisma } from '@/lib/db'

export const currenciesRouter = router({
    list: publicProcedure.query(async () => {
        const currencies = await prisma.currency.findMany({ where: { isActive: true }, orderBy: { code: 'asc' } })
        return currencies
    }),
})
