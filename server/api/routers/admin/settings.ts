import { router, protectedProcedure } from '../../trpc'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { ErrorCode, mapPrismaError, createErrorWithCode } from '@/lib/error-codes'


const settingsSchema = z.object({
    contact: z.object({
        email: z.string().email(),
        phoneNumber: z.string(),
        address: z.string(),
    }),
    storeId: z.string().optional(),
})

export type Settings = z.infer<typeof settingsSchema>

const resolveStoreId = async (storeId: string | undefined, userId: string) => {
    if (storeId) return storeId
    const store = await prisma.store.findFirst({ where: { ownerId: userId }, orderBy: { createdAt: 'asc' } })
    if (!store) {
        throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, { message: 'Store not found for this user' })
    }
    return store.id
}


export const adminSettingsRouter = router({
    list: protectedProcedure
        .input(z.object({ storeId: z.string().optional() }).optional())
        .query(async ({ input, ctx }) => {
            const storeId = await resolveStoreId(input?.storeId, ctx.session.user.id)
            const settings = await prisma.settings.findUnique({ where: { storeId } })

            if (!settings) {
                return {
                    storeId,
                    settings: {
                        contact: {
                            email: '',
                            phoneNumber: '',
                            address: ''
                        }
                    }
                }
            }

            return settings
        }),

    update: protectedProcedure.input(settingsSchema).mutation(async ({ input, ctx }) => {
        const storeId = await resolveStoreId(input.storeId, ctx.session.user.id)
        const settings = await prisma.settings.upsert({
            where: { storeId },
            update: { settings: { contact: input.contact } },
            create: { storeId, settings: { contact: input.contact } }
        })
        return settings
    })
})
