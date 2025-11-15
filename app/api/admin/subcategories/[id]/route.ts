import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const data = await request.json()

        const subcategory = await prisma.subcategory.update({
            where: { id },
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
                categoryId: data.categoryId,
                isActive: data.isActive,
                filters: data.filters,
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
