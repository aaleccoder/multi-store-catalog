import { NextRequest, NextResponse } from 'next/server'
import { requireApiAuth } from '@/lib/session'
import { prisma } from '@/lib/db'
import { subcategoryUpdateSchema } from '@/lib/api-validators'

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireApiAuth(request)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
        const { id } = await params
        const data = await request.json()
        const parsed = subcategoryUpdateSchema.safeParse(data)
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
        }

        const payload = parsed.data

        const subcategory = await prisma.subcategory.update({
            where: { id },
            data: {
                name: payload.name,
                slug: payload.slug,
                description: payload.description,
                categoryId: payload.categoryId,
                isActive: payload.isActive,
                filters: payload.filters,
            },
        })

        return NextResponse.json(subcategory)
    } catch (error) {
        console.error('Error updating subcategory:', error)
        return NextResponse.json(
            { error: 'Failed to update subcategory' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireApiAuth(request)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
        const { id } = await params

        await prisma.subcategory.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting subcategory:', error)
        return NextResponse.json(
            { error: 'Failed to delete subcategory' },
            { status: 500 }
        )
    }
}
