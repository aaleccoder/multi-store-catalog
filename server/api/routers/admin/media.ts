import { router, protectedProcedure } from '../../trpc'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { uploadFile, deleteFile } from '@/lib/minio'

export const adminMediaRouter = router({
    list: protectedProcedure.input(z.object({ page: z.number().optional(), limit: z.number().optional() }).optional()).query(async ({ input }) => {
        const page = input?.page ?? 1
        const limit = input?.limit ?? 50
        const skip = (page - 1) * limit

        const [media, totalDocs] = await Promise.all([
            prisma.media.findMany({ skip, take: limit, orderBy: { id: 'desc' } }),
            prisma.media.count(),
        ])

        return { docs: media, totalDocs, limit, page, totalPages: Math.ceil(totalDocs / limit) }
    }),

    upload: protectedProcedure
        .input(z.object({ fileBase64: z.string(), fileName: z.string(), mimeType: z.string(), alt: z.string().optional() }))
        .mutation(async ({ input }) => {
            const buffer = Buffer.from(input.fileBase64, 'base64')
            const url = await uploadFile(buffer, input.fileName, input.mimeType)

            const media = await prisma.media.create({ data: { url, alt: input.alt ?? input.fileName } })
            return media
        }),

    delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
        const id = input
        const media = await prisma.media.findUnique({ where: { id } })
        if (!media) throw new Error('Media not found')
        const fileName = media.url.split('/').pop()
        if (fileName) await deleteFile(fileName)
        await prisma.media.delete({ where: { id } })
        return { success: true }
    }),
})
