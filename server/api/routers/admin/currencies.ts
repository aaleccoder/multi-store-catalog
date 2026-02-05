import { router, protectedProcedure } from '../../trpc'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { currencySchema, currencyUpdateSchema } from '@/lib/api-validators'
import { TRPCError } from '@trpc/server'
import { ErrorCode, mapPrismaError, createErrorWithCode } from '@/lib/error-codes'

const getStoreIdFromSlug = async (slug: string, userId: string) => {
    const store = await prisma.store.findFirst({ where: { slug, ownerId: userId } })
    if (!store) {
        throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, { message: 'Store not found for this user' })
    }
    return store.id
}

const resolveStoreId = async (storeId: string | undefined, storeSlug: string | undefined, userId: string, activeStoreId?: string) => {
    if (storeId) return storeId
    if (storeSlug) return await getStoreIdFromSlug(storeSlug, userId)
    if (activeStoreId) {
        // Verify the active store belongs to the user
        const store = await prisma.store.findFirst({
            where: { id: activeStoreId, ownerId: userId }
        })
        if (store) return store.id
    }
    const store = await prisma.store.findFirst({ where: { ownerId: userId }, orderBy: { createdAt: 'asc' } })
    if (!store) {
        throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, { message: 'Store not found for this user' })
    }
    return store.id
}

export const adminCurrenciesRouter = router({
    list: protectedProcedure
        .input(z.object({ storeId: z.string().optional(), storeSlug: z.string().optional() }).optional())
        .query(async ({ input, ctx }) => {
            const storeId = await resolveStoreId(input?.storeId, input?.storeSlug, ctx.session.user.id)
            const [currencies, storeCurrencies] = await Promise.all([
                prisma.currency.findMany({ orderBy: { code: 'asc' } }),
                prisma.storeCurrency.findMany({
                    where: { storeId },
                    select: { currencyId: true, isEnabled: true },
                }),
            ])

            const enabledMap = new Map(storeCurrencies.map((item) => [item.currencyId, item.isEnabled]))

            return currencies.map((currency) => ({
                ...currency,
                isActive: enabledMap.get(currency.id) ?? false,
            }))
        }),

    create: protectedProcedure.input(currencySchema).mutation(async ({ input, ctx }) => {
        const storeId = await resolveStoreId(input?.storeId, input?.storeSlug, ctx.session.user.id, ctx.activeStoreId)
        const currency = await prisma.currency.upsert({
            where: { code: input.code.toUpperCase() },
            create: {
                name: input.name,
                code: input.code.toUpperCase(),
                symbol: input.symbol,
                symbolPosition: input.symbolPosition || 'before',
                decimalSeparator: input.decimalSeparator || '.',
                thousandsSeparator: input.thousandsSeparator || ',',
                decimalPlaces: input.decimalPlaces ?? 2,
                isActive: true,
            },
            update: {
                name: input.name,
                symbol: input.symbol,
                symbolPosition: input.symbolPosition || 'before',
                decimalSeparator: input.decimalSeparator || '.',
                thousandsSeparator: input.thousandsSeparator || ',',
                decimalPlaces: input.decimalPlaces ?? 2,
            },
        })

        await prisma.storeCurrency.upsert({
            where: { storeId_currencyId: { storeId, currencyId: currency.id } },
            create: {
                storeId,
                currencyId: currency.id,
                isEnabled: input.isActive ?? true,
            },
            update: {
                isEnabled: input.isActive ?? true,
            },
        })

        return currency
    }),

    update: protectedProcedure
        .input(z.object({ id: z.string(), storeId: z.string().optional(), storeSlug: z.string().optional(), data: currencyUpdateSchema }))
        .mutation(async ({ input, ctx }) => {
            const { id, data } = input
            const storeId = await resolveStoreId(input.storeId ?? data.storeId, input.storeSlug ?? data.storeSlug, ctx.session.user.id, ctx.activeStoreId)
            const existing = await prisma.currency.findUnique({ where: { id } })
            if (!existing) {
                throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, { message: 'Currency not found for this store' })
            }
            const currency = await prisma.currency.update({
                where: { id }, data: {
                    name: data.name,
                    code: data.code.toUpperCase(),
                    symbol: data.symbol,
                    symbolPosition: data.symbolPosition || 'before',
                    decimalSeparator: data.decimalSeparator || '.',
                    thousandsSeparator: data.thousandsSeparator || ',',
                    decimalPlaces: data.decimalPlaces ?? 2,
                }
            })

            await prisma.storeCurrency.upsert({
                where: { storeId_currencyId: { storeId, currencyId: id } },
                create: {
                    storeId,
                    currencyId: id,
                    isEnabled: data.isActive ?? true,
                },
                update: {
                    isEnabled: data.isActive ?? true,
                },
            })
            return currency
        }),

    delete: protectedProcedure.input(z.object({ id: z.string(), storeId: z.string().optional(), storeSlug: z.string().optional() })).mutation(async ({ input, ctx }) => {
        try {
            const storeId = await resolveStoreId(input?.storeId, input?.storeSlug, ctx.session.user.id, ctx.activeStoreId)
            const existing = await prisma.storeCurrency.findFirst({ where: { currencyId: input.id, storeId } })
            if (!existing) {
                throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, { message: 'Currency not found for this store' })
            }

            await prisma.storeCurrency.update({
                where: { id: existing.id },
                data: { isEnabled: false },
            })
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
