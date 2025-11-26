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
    })
})

export type Settings = z.infer<typeof settingsSchema>


export const adminSettingsRouter = router({
    list: protectedProcedure.query(async () => {
        const settings = await prisma.settings.findUnique({ where: { id: '1' } })

        if (!settings) {
            return {
                id: '1',
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

    update: protectedProcedure.input(settingsSchema).mutation(async ({ input }) => {
        const settings = await prisma.settings.upsert({
            where: { id: '1' },
            update: { settings: input },
            create: { id: '1', settings: input }
        })
        return settings
    })
})
