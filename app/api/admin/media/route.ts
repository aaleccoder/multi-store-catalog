import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/lib/minio'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const alt = formData.get('alt') as string

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to MinIO
        const url = await uploadFile(buffer, file.name, file.type)

        // Save to database
        const media = await prisma.media.create({
            data: {
                url,
                alt: alt || file.name,
            },
        })

        return NextResponse.json(media)
    } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const skip = (page - 1) * limit

        const [media, totalDocs] = await Promise.all([
            prisma.media.findMany({
                skip,
                take: limit,
                orderBy: { id: 'desc' },
            }),
            prisma.media.count(),
        ])

        return NextResponse.json({
            docs: media,
            totalDocs,
            limit,
            totalPages: Math.ceil(totalDocs / limit),
            page,
        })
    } catch (error) {
        console.error('Error fetching media:', error)
        return NextResponse.json(
            { error: 'Failed to fetch media' },
            { status: 500 }
        )
    }
}
