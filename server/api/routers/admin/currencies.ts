import { router, protectedProcedure } from '../../trpc'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { currencySchema, currencyUpdateSchema } from '@/lib/api-validators'
import { TRPCError } from '@trpc/server'
import { ErrorCode, mapPrismaError, createErrorWithCode } from '@/lib/error-codes'

const resolveStoreId = async (storeId: string | undefined, userId: string) => {
    if (storeId) return storeId
    const store = await prisma.store.findFirst({ where: { ownerId: userId }, orderBy: { createdAt: 'asc' } })
    if (!store) {
        throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, { message: 'Store not found for this user' })
    }
    return store.id
}

export const adminCurrenciesRouter = router({
    list: protectedProcedure
        .input(z.object({ storeId: z.string().optional() }).optional())
        .query(async ({ input, ctx }) => {
            const storeId = await resolveStoreId(input?.storeId, ctx.session.user.id)
            const currencies = await prisma.currency.findMany({ where: { storeId }, orderBy: { code: 'asc' } })
            return currencies
        }),

    create: protectedProcedure.input(currencySchema).mutation(async ({ input, ctx }) => {
        const storeId = await resolveStoreId(input.storeId, ctx.session.user.id)
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
                storeId,
            }
        })

        return currency
    }),

    update: protectedProcedure
        .input(z.object({ id: z.string(), storeId: z.string().optional(), data: currencyUpdateSchema }))
        .mutation(async ({ input, ctx }) => {
            const { id, data } = input
            const storeId = await resolveStoreId(input.storeId ?? data.storeId, ctx.session.user.id)
            const existing = await prisma.currency.findFirst({ where: { id, storeId } })
            if (!existing) {
                throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, { message: 'Currency not found for this store' })
            }
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

    delete: protectedProcedure.input(z.object({ id: z.string(), storeId: z.string().optional() })).mutation(async ({ input, ctx }) => {
        try {
            const storeId = await resolveStoreId(input.storeId, ctx.session.user.id)
            const existing = await prisma.currency.findFirst({ where: { id: input.id, storeId } })
            if (!existing) {
                throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, { message: 'Currency not found for this store' })
            }

            await prisma.currency.delete({ where: { id: input.id } })
            return { success: true }
        } catch (error: any) {
            // Check for Prisma errors and map to standardized codes
            const prismaErrorCode = mapPrismaError(error)
            if (prismaErrorCode) {
                throw createErrorWithCode(prismaErrorCode)
            }

            // If already a TRPCError (one we created), rethrow
            if (error instanceof TRPCError) {
                throw error
            }

            // Handle unexpected errors
            console.error('Unexpected error in currencies.delete:', error)
            throw createErrorWithCode(ErrorCode.SERVER_ERROR)
        }
    }),
})
