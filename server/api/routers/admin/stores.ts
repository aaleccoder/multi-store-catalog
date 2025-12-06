import { router, protectedProcedure } from '../../trpc'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { ErrorCode, createErrorWithCode, mapPrismaError } from '@/lib/error-codes'
import { generateSlug, sanitizeSlugInput } from '@/lib/utils'
import { Role } from '@/generated/prisma/enums'

const storeSchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(1).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    theme: z.object({
        light: z.record(z.string(), z.string()).optional(),
        dark: z.record(z.string(), z.string()).optional(),
    }).optional(),
})

const updateSchema = z.object({
    id: z.string(),
    data: storeSchema.partial(),
})

const normalizeSlug = (value: string | undefined, fallback: string) => {
    if (value && value.trim()) {
        return sanitizeSlugInput(value)
    }
    return generateSlug(fallback)
}

const ensureOwnerAccess = async (storeId: string, userId: string, role?: Role | string | null) => {
    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store) {
        throw createErrorWithCode(ErrorCode.ITEM_NOT_FOUND, { message: 'Store not found' })
    }

    if (store.ownerId !== userId && role !== Role.ADMIN) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You do not have access to this store' })
    }

    return store
}

export const adminStoresRouter = router({
    list: protectedProcedure.query(async ({ ctx }) => {
        return prisma.store.findMany({
            where: { ownerId: ctx.session.user.id },
            orderBy: { createdAt: 'asc' },
        })
    }),

    create: protectedProcedure.input(storeSchema).mutation(async ({ input, ctx }) => {
        try {
            const slug = normalizeSlug(input.slug, input.name)
            const store = await prisma.store.create({
                data: {
                    name: input.name,
                    slug,
                    description: input.description,
                    isActive: input.isActive ?? true,
                    ownerId: ctx.session.user.id,
                    theme: input.theme ?? {},
                },
            })
            return store
        } catch (error: any) {
            const prismaErrorCode = mapPrismaError(error)
            if (prismaErrorCode) {
                throw createErrorWithCode(prismaErrorCode)
            }

            if (error instanceof TRPCError) throw error

            console.error('Unexpected error in stores.create:', error)
            throw createErrorWithCode(ErrorCode.SERVER_ERROR)
        }
    }),

    update: protectedProcedure.input(updateSchema).mutation(async ({ input, ctx }) => {
        const { id, data } = input
        try {
            await ensureOwnerAccess(id, ctx.session.user.id, ctx.session.user.role as Role)

            const store = await prisma.store.update({
                where: { id },
                data: {
                    name: data.name ?? undefined,
                    slug: data.name || data.slug ? normalizeSlug(data.slug, data.name ?? '') : undefined,
                    description: data.description ?? undefined,
                    isActive: data.isActive ?? undefined,
                    theme: data.theme ?? undefined,
                },
            })
            return store
        } catch (error: any) {
            const prismaErrorCode = mapPrismaError(error)
            if (prismaErrorCode) {
                throw createErrorWithCode(prismaErrorCode)
            }

            if (error instanceof TRPCError) throw error

            console.error('Unexpected error in stores.update:', error)
            throw createErrorWithCode(ErrorCode.SERVER_ERROR)
        }
    }),

    delete: protectedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
        try {
            const store = await ensureOwnerAccess(input, ctx.session.user.id, ctx.session.user.role as Role)

            await prisma.store.delete({ where: { id: store.id } })
            return { success: true }
        } catch (error: any) {
            const prismaErrorCode = mapPrismaError(error)
            if (prismaErrorCode) {
                throw createErrorWithCode(prismaErrorCode)
            }

            if (error instanceof TRPCError) throw error

            console.error('Unexpected error in stores.delete:', error)
            throw createErrorWithCode(ErrorCode.SERVER_ERROR)
        }
    }),
})