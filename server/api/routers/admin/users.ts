import { router, adminProcedure } from '../../trpc'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { Role } from '@/generated/prisma/enums'

export const adminUsersRouter = router({
    list: adminProcedure.query(async () => {
        const users = await prisma.user.findMany({
            orderBy: { email: 'asc' },
        })
        return users
    }),

    updateRole: adminProcedure
        .input(z.object({ id: z.string(), role: z.nativeEnum(Role) }))
        .mutation(async ({ input }) => {
            const { id, role } = input
            const user = await prisma.user.update({
                where: { id },
                data: { role },
            })
            return user
        }),

    delete: adminProcedure.input(z.string()).mutation(async ({ input }) => {
        await prisma.user.delete({ where: { id: input } })
        return { success: true }
    }),
})
