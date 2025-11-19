import { router, protectedProcedure } from '../../trpc'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { currencySchema, currencyUpdateSchema } from '@/lib/api-validators'
import { TRPCError } from '@trpc/server'

export const adminCurrenciesRouter = router({
    list: protectedProcedure.query(async () => {
        const currencies = await prisma.currency.findMany({ orderBy: { code: 'asc' } })
        return currencies
    }),

    create: protectedProcedure.input(currencySchema).mutation(async ({ input }) => {
        const currency = await prisma.currency.create({
            data: {
                name: input.name,
                code: input.code,
                symbol: input.symbol,
                symbolPosition: input.symbolPosition || 'before',
                decimalSeparator: input.decimalSeparator || '.',
                thousandsSeparator: input.thousandsSeparator || ',',
                decimalPlaces: input.decimalPlaces ?? 2,
                isActive: input.isActive ?? true,
            }
        })

        return currency
    }),

    update: protectedProcedure
        .input(z.object({ id: z.string(), data: currencyUpdateSchema }))
        .mutation(async ({ input }) => {
            const { id, data } = input
            const currency = await prisma.currency.update({
                where: { id }, data: {
                    name: data.name,
                    code: data.code,
                    symbol: data.symbol,
                    symbolPosition: data.symbolPosition || 'before',
                    decimalSeparator: data.decimalSeparator || '.',
                    thousandsSeparator: data.thousandsSeparator || ',',
                    decimalPlaces: data.decimalPlaces ?? 2,
                    isActive: data.isActive ?? true,
                }
            })
            return currency
        }),

    delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
        try {
            await prisma.currency.delete({ where: { id: input } })
            return { success: true }
        } catch (error: any) {
            // Check if it's a foreign key constraint error
            if (error.code === 'P2003' || error.message?.includes('Foreign key constraint')) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'No se puede eliminar esta moneda porque tiene productos asociados'
                })
            }
            throw error
        }
    }),
})
