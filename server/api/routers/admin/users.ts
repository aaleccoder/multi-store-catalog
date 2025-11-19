import { router, adminProcedure } from '../../trpc'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { Role } from '@/generated/prisma/enums'
import { auth } from '@/lib/auth'
import { ErrorCode, createErrorWithCode } from '@/lib/error-codes'

export const adminUsersRouter = router({
    list: adminProcedure.query(async () => {
        const users = await prisma.user.findMany({
            orderBy: { email: 'asc' },
        })
        return users
    }),

    updateRole: adminProcedure
        .input(z.object({ id: z.string(), role: z.nativeEnum(Role) }))
        .mutation(async ({ input, ctx }) => {
            const { id, role } = input
            if (id === ctx.session.user.id) {
                throw createErrorWithCode(ErrorCode.CANNOT_MODIFY_SELF, {
                    message: 'Cannot modify own role',
                    details: { userId: id }
                })
            }
            const user = await prisma.user.update({
                where: { id },
                data: { role },
            })
            return user
        }),

    delete: adminProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
        if (input === ctx.session.user.id) {
            throw createErrorWithCode(ErrorCode.CANNOT_MODIFY_SELF, {
                message: 'Cannot delete own account',
                details: { userId: input }
            })
        }
        await prisma.user.delete({ where: { id: input } })
        return { success: true }
    }),

    create: adminProcedure
        .input(z.object({
            email: z.string().email(),
            password: z.string().min(8),
            name: z.string(),
            role: z.nativeEnum(Role).optional().default(Role.EDITOR)
        }))
        .mutation(async ({ input }) => {
            const { email, password, name, role } = input
            try {
                const user = await auth.api.signUpEmail({
                    body: { email, password, name }
                })
                if (role !== Role.EDITOR) {
                    await prisma.user.update({
                        where: { id: user.user.id },
                        data: { role }
                    })
                }
                const createdUser = await prisma.user.findUnique({
                    where: { id: user.user.id }
                })
                return createdUser
            } catch (error: any) {
                // Check for duplicate email
                if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
                    throw createErrorWithCode(ErrorCode.EMAIL_ALREADY_EXISTS, {
                        message: 'User with this email already exists',
                        details: { email }
                    })
                }

                // Handle unexpected errors
                console.error('Unexpected error in users.create:', error)
                throw createErrorWithCode(ErrorCode.SERVER_ERROR)
            }
        }),
})
